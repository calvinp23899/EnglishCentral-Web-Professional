using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Identity
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext db) : base(db) { }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted, ct);
        }


        public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default)
        {
            return await _db.Users
                .AnyAsync(u => u.Email == email && !u.IsDeleted, ct);
        }
    }
}
