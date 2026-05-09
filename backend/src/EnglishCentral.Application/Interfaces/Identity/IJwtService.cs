using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IJwtService
    {
        (string AccessToken, DateTimeOffset ExpiresAt) GenerateAccessToken(User user);
        Task<string> GenerateRefreshTokenAsync(User user, CancellationToken ct = default);
    }
}
