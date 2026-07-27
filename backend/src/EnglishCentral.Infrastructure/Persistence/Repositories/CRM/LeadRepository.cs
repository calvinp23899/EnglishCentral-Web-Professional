using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Common.PaginationHelpers;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.CRM
{
    public class LeadRepository : GenericRepository<Lead>, ILeadRepository
    {
        public LeadRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<PagedResult<Lead>> GetPagedWithDetailsAsync(
            int page,
            int pageSize,
            string? keyword,
            ELeadStatus? status,
            ELeadLostReason? lostReason,
            long? leadSourceId,
            long? assignedToUserId,
            long? interestedCourseId,
            DateTimeOffset? createdFrom,
            DateTimeOffset? createdTo,
            DateTimeOffset? nextFollowUpFrom,
            DateTimeOffset? nextFollowUpTo,
            bool isDescending,
            CancellationToken ct = default)
        {
            var query = BuildDetailsQuery();

            query = ApplyFilters(
                query,
                keyword,
                status,
                lostReason,
                leadSourceId,
                assignedToUserId,
                interestedCourseId,
                createdFrom,
                createdTo,
                nextFollowUpFrom,
                nextFollowUpTo);

            query = isDescending
                ? query.OrderByDescending(x => x.CreatedAt)
                : query.OrderBy(x => x.CreatedAt);

            var totalItems = await query.CountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return PagedResult<Lead>.Create(items, page, pageSize, totalItems);
        }

        public async Task<Lead?> GetByIdWithDetailsAsync(long id, CancellationToken ct = default, bool asNoTracking = true)
        {
            var query = BuildDetailsQuery(includeActivities: true, includeConversion: true);

            if (!asNoTracking)
                query = query.AsTracking();

            return await query.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<bool> ExistsByLeadCodeAsync(string leadCode, CancellationToken ct = default)
        {
            return await _dbContenxt.Leads.AnyAsync(x => x.LeadCode == leadCode, ct);
        }

        private IQueryable<Lead> BuildDetailsQuery(bool includeActivities = false, bool includeConversion = true)
        {
            var query = _dbContenxt.Leads
                .AsNoTracking()
                .Include(x => x.LeadSource)
                .Include(x => x.AssignedToUser)
                .Include(x => x.InterestedCourse)
                .AsQueryable();

            if (includeActivities)
            {
                query = query
                    .Include(x => x.Activities.OrderByDescending(a => a.CreatedAt))
                    .ThenInclude(x => x.CreatedByUser);
            }

            if (includeConversion)
            {
                query = query
                    .Include(x => x.Conversion)
                    .ThenInclude(x => x!.Student)
                    .Include(x => x.Conversion)
                    .ThenInclude(x => x!.Enrollment)
                    .Include(x => x.Conversion)
                    .ThenInclude(x => x!.ConvertedByUser);
            }

            return query.AsSplitQuery();
        }

        private static IQueryable<Lead> ApplyFilters(
            IQueryable<Lead> query,
            string? keyword,
            ELeadStatus? status,
            ELeadLostReason? lostReason,
            long? leadSourceId,
            long? assignedToUserId,
            long? interestedCourseId,
            DateTimeOffset? createdFrom,
            DateTimeOffset? createdTo,
            DateTimeOffset? nextFollowUpFrom,
            DateTimeOffset? nextFollowUpTo)
        {
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var search = keyword.Trim().ToLower();
                query = query.Where(x =>
                    x.LeadCode.ToLower().Contains(search)
                    || x.FullName.ToLower().Contains(search)
                    || x.PhoneNumber.Contains(search)
                    || (x.Email != null && x.Email.ToLower().Contains(search)));
            }

            if (status.HasValue)
                query = query.Where(x => x.Status == status.Value);

            if (lostReason.HasValue)
                query = query.Where(x => x.LostReason == lostReason.Value);

            if (leadSourceId.HasValue)
                query = query.Where(x => x.LeadSourceId == leadSourceId.Value);

            if (assignedToUserId.HasValue)
                query = query.Where(x => x.AssignedToUserId == assignedToUserId.Value);

            if (interestedCourseId.HasValue)
                query = query.Where(x => x.InterestedCourseId == interestedCourseId.Value);

            if (createdFrom.HasValue)
                query = query.Where(x => x.CreatedAt >= createdFrom.Value);

            if (createdTo.HasValue)
                query = query.Where(x => x.CreatedAt <= createdTo.Value);

            if (nextFollowUpFrom.HasValue)
                query = query.Where(x => x.NextFollowUpAt >= nextFollowUpFrom.Value);

            if (nextFollowUpTo.HasValue)
                query = query.Where(x => x.NextFollowUpAt <= nextFollowUpTo.Value);

            return query;
        }
    }
}
