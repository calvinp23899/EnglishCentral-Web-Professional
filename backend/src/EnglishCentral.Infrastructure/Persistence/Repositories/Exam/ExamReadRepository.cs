using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Common.PaginationHelpers;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Exam
{
    public class ExamReadRepository : IExamReadRepository
    {
        private readonly ApplicationDbContext _db;

        public ExamReadRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<ExamVersion?> GetVersionWithContentAsync(long id, bool asNoTracking = true, CancellationToken ct = default)
        {
            var query = _db.ExamVersions
                .Include(x => x.Sections)
                    .ThenInclude(x => x.Parts)
                    .ThenInclude(x => x.Stimuli)
                .Include(x => x.Sections)
                    .ThenInclude(x => x.Parts)
                    .ThenInclude(x => x.QuestionGroups)
                    .ThenInclude(x => x.Questions)
                    .ThenInclude(x => x.AnswerOptions)
                .Include(x => x.Sections)
                    .ThenInclude(x => x.Parts)
                    .ThenInclude(x => x.QuestionGroups)
                    .ThenInclude(x => x.Questions)
                    .ThenInclude(x => x.AnswerKeys)
                .Include(x => x.ScoringRules)
                .AsSplitQuery();

            if (asNoTracking)
                query = query.AsNoTracking();

            return await query.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<ExamVersion?> GetVersionWithSectionsAsync(long id, CancellationToken ct = default)
        {
            return await _db.ExamVersions
                .AsNoTracking()
                .Include(x => x.Sections)
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<ExamAttempt?> GetAttemptWithDetailsAsync(long id, bool asNoTracking = true, CancellationToken ct = default)
        {
            var query = _db.ExamAttempts
                .Include(x => x.SectionAttempts)
                .Include(x => x.Responses)
                .AsSplitQuery();

            if (asNoTracking)
                query = query.AsNoTracking();

            return await query.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<ExamAttempt?> GetAttemptForSubmitAsync(long id, CancellationToken ct = default)
        {
            return await _db.ExamAttempts
                .Include(x => x.ExamVersion)
                    .ThenInclude(x => x.Sections)
                    .ThenInclude(x => x.Parts)
                    .ThenInclude(x => x.QuestionGroups)
                    .ThenInclude(x => x.Questions)
                    .ThenInclude(x => x.AnswerKeys)
                .Include(x => x.Responses)
                .Include(x => x.SectionAttempts)
                .AsSplitQuery()
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<PagedResult<ExamAttempt>> GetAttemptsAsync(
            int page,
            int pageSize,
            long? examVersionId,
            long? studentId,
            EExamAttemptStatus? status,
            string? keyword,
            bool isDescending,
            CancellationToken ct = default)
        {
            var query = _db.ExamAttempts
                .AsNoTracking()
                .Include(x => x.SectionAttempts)
                .Include(x => x.Responses)
                .AsSplitQuery()
                .AsQueryable();

            if (examVersionId.HasValue)
                query = query.Where(x => x.ExamVersionId == examVersionId.Value);
            if (studentId.HasValue)
                query = query.Where(x => x.StudentId == studentId.Value);
            if (status.HasValue)
                query = query.Where(x => x.Status == status.Value);
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalizedKeyword = keyword.Trim().ToLower();
                query = query.Where(x =>
                    x.AttemptCode.ToLower().Contains(normalizedKeyword)
                    || (x.CandidateName != null && x.CandidateName.ToLower().Contains(normalizedKeyword))
                    || (x.CandidateEmail != null && x.CandidateEmail.ToLower().Contains(normalizedKeyword)));
            }

            query = isDescending
                ? query.OrderByDescending(x => x.CreatedAt)
                : query.OrderBy(x => x.CreatedAt);

            var totalItems = await query.CountAsync(ct);
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
            return PagedResult<ExamAttempt>.Create(items, page, pageSize, totalItems);
        }
    }
}
