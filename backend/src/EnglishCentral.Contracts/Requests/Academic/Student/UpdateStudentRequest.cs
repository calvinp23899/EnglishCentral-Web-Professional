using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Contracts.Requests.Academic.Student
{
    public record UpdateStudentRequest(
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
        string? NewPassword
    );
}
