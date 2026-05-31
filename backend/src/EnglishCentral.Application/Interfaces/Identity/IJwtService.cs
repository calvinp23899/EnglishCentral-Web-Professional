using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IJwtService
    {
        (string AccessToken, DateTimeOffset ExpiresAt) GenerateAccessToken(User user, bool isAdminPage = false);
        Task<string> GenerateRefreshTokenAsync(User user, CancellationToken ct = default);
    }
}
