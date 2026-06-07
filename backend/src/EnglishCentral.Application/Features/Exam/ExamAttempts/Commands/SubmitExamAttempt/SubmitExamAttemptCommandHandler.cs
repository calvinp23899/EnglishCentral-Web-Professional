using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;
using DomainExamQuestionResponse = EnglishCentral.Domain.Entities.Exam.ExamQuestionResponse;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttempt
{
    public class SubmitExamAttemptCommandHandler : IRequestHandler<SubmitExamAttemptCommand, Result<ExamAttemptResponse>>
    {
        private readonly IExamReadRepository _readRepository;

        public SubmitExamAttemptCommandHandler(IExamReadRepository readRepository)
        {
            _readRepository = readRepository;
        }

        public async Task<Result<ExamAttemptResponse>> Handle(SubmitExamAttemptCommand request, CancellationToken ct)
        {
            var attempt = await _readRepository.GetAttemptForSubmitAsync(request.AttemptId, ct);

            if (attempt is null)
                return Result<ExamAttemptResponse>.Failure("Exam attempt is not found.", 404);

            if (attempt.Status is not EExamAttemptStatus.InProgress)
                return Result<ExamAttemptResponse>.Failure("Only in-progress attempt can be submitted.", 400);

            var now = DateTimeOffset.UtcNow;
            decimal rawScore = 0;
            var responsesByQuestionId = attempt.Responses.ToDictionary(x => x.ExamQuestionId);
            var questions = attempt.ExamVersion.Sections
                .SelectMany(x => x.Parts)
                .SelectMany(x => x.QuestionGroups)
                .SelectMany(x => x.Questions)
                .ToList();

            foreach (var question in questions)
            {
                if (!responsesByQuestionId.TryGetValue(question.Id, out var response))
                    continue;

                if (question.QuestionType is EExamQuestionType.Essay or EExamQuestionType.SpeakingPrompt)
                {
                    response.ReviewStatus = EExamReviewStatus.Pending;
                    continue;
                }

                var score = ScoreObjectiveQuestion(question, response);
                response.Score = score;
                response.IsCorrect = score > 0;
                response.ReviewStatus = EExamReviewStatus.Reviewed;
                rawScore += score;
            }

            attempt.RawScore = rawScore;
            attempt.ScaledScore = rawScore;
            attempt.Status = questions.Any(x => x.QuestionType is EExamQuestionType.Essay or EExamQuestionType.SpeakingPrompt)
                ? EExamAttemptStatus.Scoring
                : EExamAttemptStatus.Completed;
            attempt.SubmittedAt = now;
            attempt.CompletedAt = attempt.Status == EExamAttemptStatus.Completed ? now : null;
            attempt.DurationSeconds = attempt.StartedAt.HasValue ? (int)(now - attempt.StartedAt.Value).TotalSeconds : null;
            attempt.UpdatedAt = now;

            foreach (var sectionAttempt in attempt.SectionAttempts)
            {
                sectionAttempt.Status = attempt.Status == EExamAttemptStatus.Completed
                    ? EExamAttemptStatus.Completed
                    : EExamAttemptStatus.Scoring;
                sectionAttempt.SubmittedAt = now;
                sectionAttempt.DurationSeconds = sectionAttempt.StartedAt.HasValue ? (int)(now - sectionAttempt.StartedAt.Value).TotalSeconds : null;
            }

            return Result<ExamAttemptResponse>.Success(attempt.ToResponse());
        }

        private static decimal ScoreObjectiveQuestion(ExamQuestion question, DomainExamQuestionResponse response)
        {
            foreach (var key in question.AnswerKeys.OrderByDescending(x => x.Score))
            {
                if (key.ExamAnswerOptionId.HasValue && response.ExamAnswerOptionId == key.ExamAnswerOptionId)
                    return key.Score;

                if (!string.IsNullOrWhiteSpace(key.CorrectValue) && !string.IsNullOrWhiteSpace(response.AnswerText))
                {
                    var comparison = key.CaseSensitive ? StringComparison.Ordinal : StringComparison.OrdinalIgnoreCase;
                    if (string.Equals(response.AnswerText.Trim(), key.CorrectValue.Trim(), comparison))
                        return key.Score;
                }
            }

            return 0;
        }
    }
}
