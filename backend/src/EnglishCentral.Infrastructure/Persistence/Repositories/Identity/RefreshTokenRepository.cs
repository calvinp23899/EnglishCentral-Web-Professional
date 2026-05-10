using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Identity
{
    public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
    {
        public RefreshTokenRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<RefreshToken?> GetTokenByRefreshTokenAndUserIdAsync(long userId, string hashToken, CancellationToken ct = default)
        {
            return await _dbContenxt.RefreshTokens.FirstOrDefaultAsync(x => x.UserId == userId && x.TokenHash == hashToken, ct);
        }
    }
}
