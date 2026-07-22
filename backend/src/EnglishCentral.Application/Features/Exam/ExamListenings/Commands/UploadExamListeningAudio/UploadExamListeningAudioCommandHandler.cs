using EnglishCentral.Application.Features.Exam.ExamListenings.DTOs;
using EnglishCentral.Application.Interfaces.Storage;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamListenings.Commands.UploadExamListeningAudio
{
    public class UploadExamListeningAudioCommandHandler : IRequestHandler<UploadExamListeningAudioCommand, Result<ExamListeningAudioUploadResponse>>
    {
        private readonly ICloudflareR2StorageService _storageService;

        public UploadExamListeningAudioCommandHandler(ICloudflareR2StorageService storageService)
        {
            _storageService = storageService;
        }

        public async Task<Result<ExamListeningAudioUploadResponse>> Handle(UploadExamListeningAudioCommand request, CancellationToken ct)
        {
            var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
            var objectKey = $"exam/listening/audio/{DateTimeOffset.UtcNow:yyyy/MM}/{Guid.NewGuid():N}{extension}";
            var contentType = string.IsNullOrWhiteSpace(request.ContentType)
                ? ResolveContentType(extension)
                : request.ContentType.Trim();

            var uploadResult = await _storageService.UploadAsync(request.FileStream, objectKey, contentType, ct);

            return Result<ExamListeningAudioUploadResponse>.Success(new ExamListeningAudioUploadResponse(
                uploadResult.ObjectKey,
                uploadResult.Url,
                request.FileName,
                contentType,
                request.Size), 201);
        }

        private static string ResolveContentType(string extension) => extension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".m4a" => "audio/mp4",
            ".aac" => "audio/aac",
            ".ogg" => "audio/ogg",
            ".webm" => "audio/webm",
            _ => "application/octet-stream"
        };
    }
}
