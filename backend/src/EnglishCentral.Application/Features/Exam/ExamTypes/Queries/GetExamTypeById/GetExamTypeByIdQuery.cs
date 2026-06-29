using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Queries.GetExamTypeById
{
    public record GetExamTypeByIdQuery(long Id) : IRequest<Result<ExamTypeResponse>>;
}
