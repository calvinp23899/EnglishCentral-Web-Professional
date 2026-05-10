namespace EnglishCentral.Contracts.Requests.Identity
{
    public record RefreshTokenRequest(
        long UserId,
        string RefreshToken
    );
}
