using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
    {
        Task<RefreshToken?> GetTokenByRefreshTokenAsync(string rawToken, bool isIncludeRolePermission = false, CancellationToken ct = default);
    }
}
