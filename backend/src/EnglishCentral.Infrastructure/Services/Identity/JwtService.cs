using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Infrastructure.Services.Identity.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace EnglishCentral.Infrastructure.Services.Identity
{
    public class JwtService : IJwtService
    {
        private readonly JwtSettings _settings;
        private readonly ApplicationDbContext _db;

        public JwtService(IOptions<JwtSettings> settings, ApplicationDbContext db)
        {
            _settings = settings.Value;
            _db = db;
        }

        public (string AccessToken, DateTimeOffset ExpiresAt) GenerateAccessToken(User user)
        {
            var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_settings.AccessTokenMinutes);

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, user.PublicId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.FullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                expires: expiresAt.UtcDateTime,
                signingCredentials: creds
            );

            return (new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token), expiresAt);
        }

        public async Task<string> GenerateRefreshTokenAsync(User user, CancellationToken ct = default)
        {
            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var tokenHash = Convert.ToBase64String(
                SHA256.HashData(Encoding.UTF8.GetBytes(rawToken))
            );

            var refreshToken = new RefreshToken
            {
                PublicId = Guid.NewGuid(),
                User = user,
                TokenHash = tokenHash,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(_settings.RefreshTokenDays),
                CreatedAt = DateTimeOffset.UtcNow
            };

            _db.RefreshTokens.Add(refreshToken);
            return rawToken;
        }
    }
}
