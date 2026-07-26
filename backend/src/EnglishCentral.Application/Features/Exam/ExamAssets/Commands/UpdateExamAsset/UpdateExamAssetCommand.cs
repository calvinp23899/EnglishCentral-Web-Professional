using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UpdateExamAsset
{
    public record UpdateExamAssetCommand(
        long Id,
        string? OriginalFileName,
        EExamAssetStatus Status,
        int? DurationSeconds,
        string? MetadataJson) : IRequest<Result<ExamAssetResponse>>;
}
