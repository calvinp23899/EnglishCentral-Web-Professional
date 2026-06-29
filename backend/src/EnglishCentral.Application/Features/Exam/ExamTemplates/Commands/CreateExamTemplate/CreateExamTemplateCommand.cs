using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.CreateExamTemplate
{
    public record CreateExamTemplateCommand(
        long ExamTypeId,
        string Code,
        string Name,
        string? Description,
        int? DurationMinutes,
        decimal? TotalScore,
        bool IsActive) : IRequest<Result<ExamTemplateResponse>>;
}
