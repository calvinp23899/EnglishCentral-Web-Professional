using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Exam
{
    public class ExamVersionDraftRepository : IExamVersionDraftRepository
    {
        private readonly ApplicationDbContext _db;

        public ExamVersionDraftRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<ExamVersion?> GetVersionForUpdateAsync(long id, CancellationToken ct = default)
        {
            return await _db.ExamVersions.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<bool> HasAttemptsAsync(long examVersionId, CancellationToken ct = default)
        {
            return await _db.ExamAttempts.AnyAsync(x => x.ExamVersionId == examVersionId, ct);
        }

        public async Task ReplaceVersionContentAsync(
            ExamVersion version,
            IReadOnlyCollection<ExamSection> sections,
            IReadOnlyCollection<ExamScoringRule> scoringRules,
            CancellationToken ct = default)
        {
            var sectionIds = await _db.ExamSections
                .Where(x => x.ExamVersionId == version.Id)
                .Select(x => x.Id)
                .ToListAsync(ct);

            var partIds = await _db.ExamParts
                .Where(x => sectionIds.Contains(x.ExamSectionId))
                .Select(x => x.Id)
                .ToListAsync(ct);

            var stimulusIds = await _db.ExamStimuli
                .Where(x => partIds.Contains(x.ExamPartId))
                .Select(x => x.Id)
                .ToListAsync(ct);

            var groupIds = await _db.ExamQuestionGroups
                .Where(x => partIds.Contains(x.ExamPartId))
                .Select(x => x.Id)
                .ToListAsync(ct);

            var questionIds = await _db.ExamQuestions
                .Where(x => groupIds.Contains(x.ExamQuestionGroupId))
                .Select(x => x.Id)
                .ToListAsync(ct);

            _db.ExamAnswerKeys.RemoveRange(_db.ExamAnswerKeys.Where(x => questionIds.Contains(x.ExamQuestionId)));
            _db.ExamAnswerOptions.RemoveRange(_db.ExamAnswerOptions.Where(x => questionIds.Contains(x.ExamQuestionId)));
            _db.ExamQuestions.RemoveRange(_db.ExamQuestions.Where(x => questionIds.Contains(x.Id)));
            _db.ExamQuestionGroups.RemoveRange(_db.ExamQuestionGroups.Where(x => groupIds.Contains(x.Id)));
            _db.ExamStimuli.RemoveRange(_db.ExamStimuli.Where(x => stimulusIds.Contains(x.Id)));
            _db.ExamParts.RemoveRange(_db.ExamParts.Where(x => partIds.Contains(x.Id)));
            _db.ExamSections.RemoveRange(_db.ExamSections.Where(x => sectionIds.Contains(x.Id)));
            _db.ExamScoringRules.RemoveRange(_db.ExamScoringRules.Where(x => x.ExamVersionId == version.Id));

            foreach (var section in sections)
                version.Sections.Add(section);

            foreach (var scoringRule in scoringRules)
                version.ScoringRules.Add(scoringRule);
        }
    }
}
