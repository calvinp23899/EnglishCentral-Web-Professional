using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using DomainExamQuestionResponse = EnglishCentral.Domain.Entities.Exam.ExamQuestionResponse;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Services
{
    internal static class ExamAttemptScoringService
    {
        public static void ScoreAttempt(ExamAttempt attempt, DateTimeOffset submittedAt)
        {
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
            attempt.SubmittedAt = submittedAt;
            attempt.CompletedAt = attempt.Status == EExamAttemptStatus.Completed ? submittedAt : null;
            attempt.DurationSeconds = attempt.StartedAt.HasValue ? (int)(submittedAt - attempt.StartedAt.Value).TotalSeconds : null;
            attempt.UpdatedAt = submittedAt;

            foreach (var sectionAttempt in attempt.SectionAttempts)
            {
                sectionAttempt.Status = attempt.Status == EExamAttemptStatus.Completed
                    ? EExamAttemptStatus.Completed
                    : EExamAttemptStatus.Scoring;
                sectionAttempt.SubmittedAt = submittedAt;
                sectionAttempt.DurationSeconds = sectionAttempt.StartedAt.HasValue ? (int)(submittedAt - sectionAttempt.StartedAt.Value).TotalSeconds : null;
            }
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
