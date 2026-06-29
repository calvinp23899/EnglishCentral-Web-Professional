namespace EnglishCentral.Contracts.Responses.Identity
{
    public record AccountResponse
    (
        long Id,
        string Email,
        string? PhoneNumber,
        string FullName,
        string? Status
    );
}
