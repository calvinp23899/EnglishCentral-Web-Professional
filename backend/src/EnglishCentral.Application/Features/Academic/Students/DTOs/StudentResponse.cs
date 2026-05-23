using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.Students.DTOs
{
    public record StudentResponse(
        Guid PublicId,
        string StudentCode,
        string FullName,
        DateOnly? DateOfBirth,
        Gender Gender,
        string? Email,
        string? PhoneNumber,
        string? Address,
        string? ParentName,
        string? ParentPhoneNumber,
        DateOnly EnrollmentDate,
        StudentStatus Status,
        string? Notes,
        long? UserId,
        StudentAccount? Account
    );

    public record StudentAccount(
        long? AccountId,
        string? AccountEmail,
        bool? IsActive
    );
}
