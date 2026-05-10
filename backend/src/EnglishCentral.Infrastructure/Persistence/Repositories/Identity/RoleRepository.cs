using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Identity
{
    public class RoleRepository : GenericRepository<Role>, IRoleRepository
    {

        public RoleRepository(ApplicationDbContext context)
            : base(context)
        {
        }

        public async Task<Role?> GetByNameAsync(string name, CancellationToken ct = default)
        {
            return await _dbContenxt.Roles.FirstOrDefaultAsync(x => x.Name == name, ct);
        }
    }
}
