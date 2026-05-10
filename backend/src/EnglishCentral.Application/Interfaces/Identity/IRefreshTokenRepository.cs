using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetTokenByRefreshTokenAndUserIdAsync(string userId, string hashToken, bool isIncludeRolePermission = false, CancellationToken ct = default);
    }
}
