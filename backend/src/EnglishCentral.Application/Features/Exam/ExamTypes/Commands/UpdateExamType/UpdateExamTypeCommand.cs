using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.UpdateExamType
{
    public record UpdateExamTypeCommand(
        long Id,
        string Code,
        string Name,
        EExamFamily Family,
        string? Description,
        bool IsActive) : IRequest<Result<ExamTypeResponse>>;
}
