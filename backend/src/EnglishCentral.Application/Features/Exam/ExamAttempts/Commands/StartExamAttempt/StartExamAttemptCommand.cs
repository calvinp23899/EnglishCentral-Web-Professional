using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.StartExamAttempt
{
    public record StartExamAttemptCommand(
        long ExamVersionId,
        long? StudentId,
        string? CandidateName,
        string? CandidateEmail) : IRequest<Result<ExamAttemptResponse>>;
}
