using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Common.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Identity
{
    public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<RefreshToken?> GetTokenByRefreshTokenAndUserIdAsync(string userPublicId, string rawToken, bool isIncludeRolePermission = false, CancellationToken ct = default)
        {
            string hashToken = TokenHashHelper.HashRefreshToken(rawToken);
            if (!Guid.TryParse(userPublicId, out Guid publicId))
            {
                return null;
            }
            IQueryable<RefreshToken> query = _dbContenxt.RefreshTokens;
            if (isIncludeRolePermission)
            {
                query = query
                    .Include(x => x.User)
                        .ThenInclude(x => x.UserRoles)
                            .ThenInclude(x => x.Role)
                                .ThenInclude(x => x.RolePermissions)
                                    .ThenInclude(x => x.Permission);
            }
            return await query.FirstOrDefaultAsync(x => x.User.PublicId == publicId && x.TokenHash == hashToken, ct);
        }
    }
}
