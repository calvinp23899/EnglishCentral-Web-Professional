using EnglishCentral.Domain.Entities.Exam;

namespace EnglishCentral.Application.Interfaces.Exam
{
    public interface IExamVersionDraftRepository
    {
        Task<ExamVersion?> GetVersionForUpdateAsync(long id, CancellationToken ct = default);

        Task<bool> HasAttemptsAsync(long examVersionId, CancellationToken ct = default);

        Task ReplaceVersionContentAsync(
            ExamVersion version,
            IReadOnlyCollection<ExamSection> sections,
            IReadOnlyCollection<ExamScoringRule> scoringRules,
            CancellationToken ct = default);
    }
}
