using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.Students.DTOs
{
    public record StudentResponse(
        Guid PublicId,
        long Id,
        string StudentCode,
        string FullName,
        DateOnly? DateOfBirth,
        EGender Gender,
        string? Email,
        string? PhoneNumber,
        string? Address,
        string? ParentName,
        string? ParentPhoneNumber,
        DateOnly EnrollmentDate,
        EStatus Status,
        string? Notes,
        long? UserId,
        StudentAccount? Account
    );

    public record StudentAccount(
        long? AccountId,
        string? AccountEmail,
        bool? IsDelete
    );
}
