namespace EnglishCentral.Contracts.Requests.Identity
{
    public record LogoutRequest(
        string UserPublicId,
        string RawRefreshToken
    );
}
