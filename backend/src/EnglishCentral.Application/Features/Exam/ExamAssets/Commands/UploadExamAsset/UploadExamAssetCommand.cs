using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UploadExamAsset
{
    public record UploadExamAssetCommand(
        Stream FileStream,
        string FileName,
        string? ContentType,
        long Size,
        EExamAssetType AssetType,
        int? DurationSeconds,
        string? MetadataJson) : IRequest<Result<ExamAssetResponse>>;
}
