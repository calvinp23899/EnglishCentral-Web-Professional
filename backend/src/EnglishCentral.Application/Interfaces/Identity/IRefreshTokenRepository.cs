using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetTokenByRefreshTokenAndUserIdAsync(long userId, string hashToken, CancellationToken ct = default);
    }
}
