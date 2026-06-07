using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.UpdateExamTemplate
{
    public record UpdateExamTemplateCommand(
        long Id,
        string Code,
        string Name,
        string? Description,
        int? DurationMinutes,
        decimal? TotalScore,
        bool IsActive) : IRequest<Result<ExamTemplateResponse>>;
}
