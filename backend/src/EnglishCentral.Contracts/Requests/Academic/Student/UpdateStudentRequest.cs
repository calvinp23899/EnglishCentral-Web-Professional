using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Contracts.Requests.Academic.Student
{
    public record UpdateStudentRequest(
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
        string? Notes
    );
}
