namespace EnglishCentral.Contracts.Requests.Identity
{
    public record LogoutRequest(
        long UserId,
        string RawRefreshToken
    );
}
