namespace EnglishCentral.Infrastructure.Services.Identity.Models
{
    public class JwtSettings
    {
        public string SecretKey { get; init; } = string.Empty;
        public string Issuer { get; init; } = string.Empty;
        public string Audience { get; init; } = string.Empty;
        public int AccessTokenMinutes { get; init; } = 120;
        public int RefreshTokenDays { get; init; } = 30;
    }
}
