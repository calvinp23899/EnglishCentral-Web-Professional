using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Common.PaginationHelpers;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.CRM
{
    public class LeadConversionRepository : GenericRepository<LeadConversion>, ILeadConversionRepository
    {
        public LeadConversionRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<PagedResult<LeadConversion>> GetPagedWithDetailsAsync(
            int page,
            int pageSize,
            long? leadSourceId,
            long? convertedByUserId,
            DateTimeOffset? convertedFrom,
            DateTimeOffset? convertedTo,
            bool isDescending,
            CancellationToken ct = default)
        {
            var query = BuildDetailsQuery();

            if (leadSourceId.HasValue)
                query = query.Where(x => x.SourceIdSnapshot == leadSourceId.Value);

            if (convertedByUserId.HasValue)
                query = query.Where(x => x.ConvertedByUserId == convertedByUserId.Value);

            if (convertedFrom.HasValue)
                query = query.Where(x => x.ConvertedAt >= convertedFrom.Value);

            if (convertedTo.HasValue)
                query = query.Where(x => x.ConvertedAt <= convertedTo.Value);

            query = isDescending
                ? query.OrderByDescending(x => x.ConvertedAt)
                : query.OrderBy(x => x.ConvertedAt);

            var totalItems = await query.CountAsync(ct);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return PagedResult<LeadConversion>.Create(items, page, pageSize, totalItems);
        }

        public async Task<LeadConversion?> GetByIdWithDetailsAsync(long id, CancellationToken ct = default)
        {
            return await BuildDetailsQuery().FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        private IQueryable<LeadConversion> BuildDetailsQuery()
        {
            return _dbContenxt.LeadConversions
                .AsNoTracking()
                .Include(x => x.Lead)
                    .ThenInclude(x => x.LeadSource)
                .Include(x => x.Student)
                .Include(x => x.Enrollment)
                .Include(x => x.ConvertedByUser)
                .AsSplitQuery();
        }
    }
}
