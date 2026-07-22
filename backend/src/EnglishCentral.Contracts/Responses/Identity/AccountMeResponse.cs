namespace EnglishCentral.Contracts.Responses.Identity
{
    public record AccountMeResponse(
        string Email,
        string? PhoneNumber,
        string FullName,
        StudentProfileResponse? Student
    );

    public record StudentProfileResponse(
        string StudentCode,
        DateOnly? DateOfBirth,
        string Gender,
        string? Email,
        string? PhoneNumber,
        Guid PublicId
    );
}
