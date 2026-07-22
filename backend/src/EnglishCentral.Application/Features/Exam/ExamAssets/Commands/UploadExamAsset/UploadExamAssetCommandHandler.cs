using System.Security.Cryptography;
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
            var objectKey = BuildObjectKey(request.AssetType, extension);

            await using var uploadStream = new MemoryStream();
            await request.FileStream.CopyToAsync(uploadStream, ct);
            var checksum = Convert.ToHexString(SHA256.HashData(uploadStream.ToArray())).ToLowerInvariant();
            uploadStream.Position = 0;

            var uploadResult = await _storageService.UploadAsync(uploadStream, objectKey, contentType, ct);
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
                MetadataJson = request.MetadataJson
            };

            await _repository.AddAsync(entity, ct);
            return Result<ExamAssetResponse>.Success(entity.ToResponse(), 201);
        }

        private static string BuildObjectKey(EExamAssetType assetType, string extension)
        {
            var folder = assetType.ToString().ToLowerInvariant();
            return $"exam/assets/{folder}/{DateTimeOffset.UtcNow:yyyy/MM}/{Guid.NewGuid():N}{extension}";
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
