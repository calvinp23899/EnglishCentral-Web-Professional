namespace EnglishCentral.Contracts.Responses.Identity
{
    public record AuthResponse(
        Guid PublicId,
        string FullName,
        string Email,
        string AccessToken,
        string RefreshToken,
        DateTimeOffset AccessTokenExpiresAt
    );
}
