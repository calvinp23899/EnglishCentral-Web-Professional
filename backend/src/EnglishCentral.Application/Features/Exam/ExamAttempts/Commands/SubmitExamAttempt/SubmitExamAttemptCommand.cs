using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttempt
{
    public record SubmitExamAttemptCommand(long AttemptId) : IRequest<Result<ExamAttemptResponse>>;
}
