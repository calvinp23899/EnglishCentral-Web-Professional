using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CreateExamVersion;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.UpdateExamVersionDraft
{
    public record UpdateExamVersionDraftCommand(
        long Id,
        string? Slug,
        string Name,
        string? Description,
        int? DurationMinutes,
        decimal? TotalScore,
        EExamScoringMode ScoringMode,
        object? RuntimeConfigJson,
        string? ScoringConfigJson,
        List<CreateExamSectionRequest> Sections,
        List<CreateExamScoringRuleRequest>? ScoringRules) : IRequest<Result<ExamVersionResponse>>;
}
