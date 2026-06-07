using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Queries.GetExamAttemptById
{
    public record GetExamAttemptByIdQuery(long Id) : IRequest<Result<ExamAttemptResponse>>;
}
