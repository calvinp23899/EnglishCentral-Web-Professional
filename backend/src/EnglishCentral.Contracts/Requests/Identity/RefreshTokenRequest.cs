namespace EnglishCentral.Contracts.Requests.Identity
{
    public record RefreshTokenRequest(
        string UserPublicId,
        string RefreshToken
    );
}
