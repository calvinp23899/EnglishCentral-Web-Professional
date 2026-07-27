using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.CRM
{
    public class LeadActivityRepository : GenericRepository<LeadActivity>, ILeadActivityRepository
    {
        public LeadActivityRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<List<LeadActivity>> GetByLeadIdAsync(long leadId, CancellationToken ct = default)
        {
            return await _dbContenxt.LeadActivities
                .AsNoTracking()
                .Include(x => x.CreatedByUser)
                .Where(x => x.LeadId == leadId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(ct);
        }
    }
}
