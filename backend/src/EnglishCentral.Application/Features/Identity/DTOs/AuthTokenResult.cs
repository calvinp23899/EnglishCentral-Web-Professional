namespace EnglishCentral.Application.Features.Identity.DTOs
{
    public record AuthTokenResult(
        Guid PublicId,
        string FullName,
        string Email,
        string AccessToken,
        string RefreshToken,
        DateTimeOffset AccessTokenExpiresAt
    );
}
