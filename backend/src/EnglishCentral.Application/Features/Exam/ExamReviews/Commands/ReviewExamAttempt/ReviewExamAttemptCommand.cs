using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamReviews.Commands.ReviewExamAttempt
{
    public record ReviewExamAttemptCommand(
        long AttemptId,
        long? ReviewerId,
        decimal? Score,
        string? Feedback,
        string? RubricJson,
        List<ReviewExamQuestionResponseRequest>? Responses) : IRequest<Result<ExamAttemptResponse>>;

    public record ReviewExamQuestionResponseRequest(
        long ResponseId,
        decimal? Score,
        bool? IsCorrect,
        string? Feedback);
}
