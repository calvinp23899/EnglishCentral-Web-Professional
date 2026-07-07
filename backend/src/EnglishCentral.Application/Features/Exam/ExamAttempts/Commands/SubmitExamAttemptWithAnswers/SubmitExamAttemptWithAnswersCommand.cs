using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttemptWithAnswers
{
    public record SubmitExamAttemptWithAnswersCommand(
        long ExamVersionId,
        long? StudentId,
        string? CandidateName,
        string? CandidateEmail,
        DateTimeOffset? StartedAt,
        List<SubmitExamAnswerRequest> Answers) : IRequest<Result<ExamAttemptResponse>>;

    public record SubmitExamAnswerRequest(
        long QuestionId,
        long? AnswerOptionId,
        string? AnswerText,
        string? AnswerJson);
}
