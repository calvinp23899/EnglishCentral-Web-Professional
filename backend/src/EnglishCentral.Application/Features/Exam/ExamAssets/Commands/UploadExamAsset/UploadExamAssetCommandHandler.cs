using System.Security.Cryptography;
using System.Text.RegularExpressions;
using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Application.Interfaces.Storage;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UploadExamAsset
{
    public class UploadExamAssetCommandHandler : IRequestHandler<UploadExamAssetCommand, Result<ExamAssetResponse>>
    {
        private readonly IExamRepository<ExamAsset> _repository;
        private readonly ICloudflareR2StorageService _storageService;

        public UploadExamAssetCommandHandler(IExamRepository<ExamAsset> repository, ICloudflareR2StorageService storageService)
        {
            _repository = repository;
            _storageService = storageService;
        }

        public async Task<Result<ExamAssetResponse>> Handle(UploadExamAssetCommand request, CancellationToken ct)
        {
            var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
            var contentType = string.IsNullOrWhiteSpace(request.ContentType)
                ? ResolveContentType(extension)
                : request.ContentType.Trim();
            var metadataResult = ExamAssetMetadataHelper.Normalize(request.MetadataJson);
            if (!metadataResult.IsSuccess || metadataResult.Metadata is null)
                return Result<ExamAssetResponse>.Failure(metadataResult.Error ?? "MetadataJson is invalid.", 400);

            var objectKey = BuildObjectKey(request.AssetType, metadataResult.Metadata.TypeExam, request.FileName, extension);
            var isDuplicatedKey = await _repository.ExistsAsync(x => x.ObjectKey == objectKey && x.Status != EExamAssetStatus.Deleted, ct);
            if (isDuplicatedKey)
                return Result<ExamAssetResponse>.Failure("An asset with the same file name already exists in this exam upload folder.", 409);

            await using var uploadStream = new MemoryStream();
            await request.FileStream.CopyToAsync(uploadStream, ct);
            var checksum = Convert.ToHexString(SHA256.HashData(uploadStream.ToArray())).ToLowerInvariant();
            uploadStream.Position = 0;

            CloudflareR2UploadResult uploadResult;
            try
            {
                uploadResult = await _storageService.UploadAsync(uploadStream, objectKey, contentType, ct);
            }
            catch (InvalidOperationException ex)
            {
                return Result<ExamAssetResponse>.Failure(ex.Message, 502);
            }

            var entity = new ExamAsset
            {
                AssetType = request.AssetType,
                Provider = EExamAssetProvider.CloudflareR2,
                Status = EExamAssetStatus.Uploaded,
                BucketName = uploadResult.BucketName,
                ObjectKey = uploadResult.ObjectKey,
                PublicUrl = uploadResult.Url,
                OriginalFileName = request.FileName.Trim(),
                ContentType = contentType,
                FileSize = request.Size,
                Checksum = checksum,
                DurationSeconds = request.DurationSeconds,
                MetadataJson = metadataResult.NormalizedJson
            };

            await _repository.AddAsync(entity, ct);
            return Result<ExamAssetResponse>.Success(entity.ToResponse(), 201);
        }

        private static string BuildObjectKey(EExamAssetType assetType, EExamTypeUpload typeExam, string originalFileName, string extension)
        {
            var folder = assetType.ToString().ToLowerInvariant();
            var examFolder = ExamAssetMetadataHelper.ToFolderSegment(typeExam);
            var fileName = SanitizeFileName(originalFileName, extension);
            return $"exam/assets/{folder}/{examFolder}/{fileName}";
        }

        private static string SanitizeFileName(string originalFileName, string extension)
        {
            var fileName = Path.GetFileName(originalFileName.Trim());
            if (string.IsNullOrWhiteSpace(fileName))
                return $"{Guid.NewGuid():N}{extension}";

            fileName = Regex.Replace(fileName, @"[\\/]+", "_");
            foreach (var invalidChar in Path.GetInvalidFileNameChars())
            {
                fileName = fileName.Replace(invalidChar, '_');
            }

            return fileName;
        }

        private static string ResolveContentType(string extension) => extension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".m4a" => "audio/mp4",
            ".aac" => "audio/aac",
            ".ogg" => "audio/ogg",
            ".webm" => "audio/webm",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            ".mp4" => "video/mp4",
            ".mov" => "video/quicktime",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            _ => "application/octet-stream"
        };
    }
}
