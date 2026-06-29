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
            return await _dbContenxt.Users
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                        .ThenInclude(x => x.RolePermissions)
                            .ThenInclude(x => x.Permission)
                .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted, ct);
        }


        public async Task<bool> IsEmailExistsAsync(string email, CancellationToken ct = default)
        {
            return await _dbContenxt.Users
                .AnyAsync(u => u.Email == email && !u.IsDeleted, ct);
        }

        public async Task<User?> GetByPublicIdAsync(Guid publicId, CancellationToken ct = default)
        {
            return await _dbContenxt.Users
                .FirstOrDefaultAsync(u => u.PublicId == publicId && !u.IsDeleted, ct);
        }

        public async Task<User?> GetByIdWithRolesAsync(long id, CancellationToken ct = default)
        {
            return await _dbContenxt.Users
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                        .ThenInclude(x => x.RolePermissions)
                            .ThenInclude(x => x.Permission)
                .FirstOrDefaultAsync(x =>
                    x.Id == id,
                    ct);
        }

        public async Task<List<User>> GetUserAccountBySearch(string? search, string roleName, CancellationToken ct = default)
        {
            var query = _dbContenxt.Users
                .AsNoTracking()
                .Where(x =>
                    !x.IsDeleted
                    && x.IsActive
                    && x.UserRoles.Any(userRole => userRole.Role.Name == roleName))
                .AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var keyword = search.Trim().ToLower();
                query = query.Where(x =>
                       x.FullName.ToLower().Contains(keyword)
                       || (x.Email != null && x.Email.ToLower().Contains(keyword))
                       || (x.PhoneNumber != null && x.PhoneNumber.Contains(keyword)));
            }
            return await query
                    .Skip((1 - 1) * 10)
                    .Take(5)
                    .ToListAsync(ct);
        }

        public async Task<bool> IsPhoneNumberExistsAsync(string phoneNumber, CancellationToken ct = default)
        {
            return await _dbContenxt.Users
                .AnyAsync(u => u.PhoneNumber.Equals(phoneNumber) && !u.IsDeleted, ct);
        }
    }
}
