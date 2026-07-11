using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using System.Text.Json;
using DomainExamQuestionResponse = EnglishCentral.Domain.Entities.Exam.ExamQuestionResponse;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Services
{
    internal static class ExamAttemptScoringService
    {
        private static readonly IReadOnlyList<BandScoreRange> DefaultIeltsReadingBandScale =
        [
            new(39, 40, 9m),
            new(37, 38, 8.5m),
            new(35, 36, 8m),
            new(33, 34, 7.5m),
            new(30, 32, 7m),
            new(27, 29, 6.5m),
            new(23, 26, 6m),
            new(19, 22, 5.5m),
            new(15, 18, 5m),
            new(13, 14, 4.5m),
            new(10, 12, 4m),
            new(8, 9, 3.5m),
            new(6, 7, 3m),
            new(4, 5, 2.5m)
        ];

        public static void ScoreAttempt(ExamAttempt attempt, DateTimeOffset submittedAt)
        {
            ScoreAttempt(attempt, attempt.ExamVersion, submittedAt);
        }

        public static void ScoreAttempt(ExamAttempt attempt, ExamVersion version, DateTimeOffset submittedAt)
        {
            decimal rawScore = 0;
            var responsesByQuestionId = attempt.Responses.ToDictionary(x => x.ExamQuestionId);
            var questions = version.Sections
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
            attempt.BandScore = CalculateBandScore(rawScore, version.ScoringConfigJson);
            attempt.Status = questions.Any(x => x.QuestionType is EExamQuestionType.Essay or EExamQuestionType.SpeakingPrompt)
                ? EExamAttemptStatus.Scoring
                : EExamAttemptStatus.Completed;
            attempt.SubmittedAt = submittedAt;
            attempt.CompletedAt = attempt.Status == EExamAttemptStatus.Completed ? submittedAt : null;
            attempt.DurationSeconds = attempt.StartedAt.HasValue ? (int)(submittedAt - attempt.StartedAt.Value).TotalSeconds : null;
            attempt.UpdatedAt = submittedAt;

            foreach (var sectionAttempt in attempt.SectionAttempts)
            {
                var sectionQuestionIds = version.Sections
                    .Where(x => x.Id == sectionAttempt.ExamSectionId)
                    .SelectMany(x => x.Parts)
                    .SelectMany(x => x.QuestionGroups)
                    .SelectMany(x => x.Questions)
                    .Select(x => x.Id)
                    .ToHashSet();

                var sectionRawScore = attempt.Responses
                    .Where(x => sectionQuestionIds.Contains(x.ExamQuestionId) && x.Score.HasValue)
                    .Sum(x => x.Score!.Value);

                sectionAttempt.RawScore = sectionRawScore;
                sectionAttempt.ScaledScore = sectionRawScore;
                sectionAttempt.BandScore = CalculateBandScore(sectionRawScore, version.ScoringConfigJson);
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

        public static decimal? CalculateBandScore(decimal? rawScore, string? scoringConfigJson)
        {
            if (!rawScore.HasValue)
                return null;

            return CalculateBandScore(rawScore.Value, scoringConfigJson);
        }

        private static decimal? CalculateBandScore(decimal rawScore, string? scoringConfigJson)
        {
            var roundedCorrectAnswers = (int)Math.Round(rawScore, MidpointRounding.AwayFromZero);
            var scale = ResolveBandScale(scoringConfigJson);
            var matchedRange = scale.FirstOrDefault(x =>
                roundedCorrectAnswers >= x.MinCorrect
                && roundedCorrectAnswers <= x.MaxCorrect);

            return matchedRange?.Band ?? 0;
        }

        private static IReadOnlyList<BandScoreRange> ResolveBandScale(string? scoringConfigJson)
        {
            var configuredScale = TryReadBandScale(scoringConfigJson);
            return configuredScale.Count > 0
                ? configuredScale
                : DefaultIeltsReadingBandScale;
        }

        private static List<BandScoreRange> TryReadBandScale(string? scoringConfigJson)
        {
            if (string.IsNullOrWhiteSpace(scoringConfigJson))
                return [];

            try
            {
                using var document = JsonDocument.Parse(scoringConfigJson);
                var root = document.RootElement;

                if (root.ValueKind == JsonValueKind.Object
                    && root.TryGetProperty("bandScore", out var bandScore)
                    && bandScore.ValueKind == JsonValueKind.Object
                    && bandScore.TryGetProperty("scale", out var nestedScale))
                    return ParseBandScale(nestedScale);

                if (root.ValueKind == JsonValueKind.Object
                    && root.TryGetProperty("bandScale", out var bandScale))
                    return ParseBandScale(bandScale);

                if (root.ValueKind == JsonValueKind.Object
                    && root.TryGetProperty("bandScores", out var bandScores))
                    return ParseBandScale(bandScores);

                return root.ValueKind == JsonValueKind.Array
                    ? ParseBandScale(root)
                    : [];
            }
            catch (JsonException)
            {
                return [];
            }
        }

        private static List<BandScoreRange> ParseBandScale(JsonElement scaleElement)
        {
            if (scaleElement.ValueKind != JsonValueKind.Array)
                return [];

            var ranges = new List<BandScoreRange>();
            foreach (var item in scaleElement.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object)
                    continue;

                var min = TryGetInt(item, "minCorrect", "min", "from");
                var max = TryGetInt(item, "maxCorrect", "max", "to");
                var band = TryGetDecimal(item, "band", "score", "bandScore");

                if (!min.HasValue || !max.HasValue || !band.HasValue)
                    continue;

                ranges.Add(new BandScoreRange(
                    Math.Min(min.Value, max.Value),
                    Math.Max(min.Value, max.Value),
                    band.Value));
            }

            return ranges
                .OrderByDescending(x => x.MaxCorrect)
                .ThenByDescending(x => x.MinCorrect)
                .ToList();
        }

        private static int? TryGetInt(JsonElement item, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (!item.TryGetProperty(propertyName, out var property))
                    continue;

                if (property.ValueKind == JsonValueKind.Number && property.TryGetInt32(out var value))
                    return value;
            }

            return null;
        }

        private static decimal? TryGetDecimal(JsonElement item, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (!item.TryGetProperty(propertyName, out var property))
                    continue;

                if (property.ValueKind == JsonValueKind.Number && property.TryGetDecimal(out var value))
                    return value;
            }

            return null;
        }

        private sealed record BandScoreRange(int MinCorrect, int MaxCorrect, decimal Band);
    }
}
