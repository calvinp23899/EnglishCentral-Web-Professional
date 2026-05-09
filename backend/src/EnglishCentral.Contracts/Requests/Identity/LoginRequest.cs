namespace EnglishCentral.Contracts.Requests.Identity
{
    public record LoginRequest(
        string Email,
        string Password
    );
}
