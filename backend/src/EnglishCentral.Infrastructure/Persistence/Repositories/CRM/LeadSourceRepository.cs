using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.CRM
{
    public class LeadSourceRepository : GenericRepository<LeadSource>, ILeadSourceRepository
    {
        public LeadSourceRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<bool> ExistsByCodeAsync(string code, long? excludeId = null, CancellationToken ct = default)
        {
            var normalizedCode = code.Trim().ToUpper();

            return await _dbContenxt.LeadSources
                .AnyAsync(x =>
                    x.Code.ToUpper() == normalizedCode
                    && (!excludeId.HasValue || x.Id != excludeId.Value),
                    ct);
        }
    }
}
