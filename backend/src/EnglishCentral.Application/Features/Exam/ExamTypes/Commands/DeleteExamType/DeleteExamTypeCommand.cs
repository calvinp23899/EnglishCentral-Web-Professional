using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.DeleteExamType
{
    public record DeleteExamTypeCommand(long Id) : IRequest<Result<bool>>;
}
