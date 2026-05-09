namespace EnglishCentral.Contracts.Requests.Identity
{
    public record RegisterRequest(
        string FullName,
        string Email,
        string Password,
        string? PhoneNumber
    );
}
