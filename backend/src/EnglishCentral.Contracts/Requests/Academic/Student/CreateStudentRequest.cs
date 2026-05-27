using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Contracts.Requests.Academic.Student
{
    public record CreateStudentRequest(
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
        bool IsAccountExists,
        StudentAccountRequest Account
    );

    public record StudentAccountRequest(
        long? UserId,
        string? Email,
        string? PhoneNumber,
        string? FullName,
        string? Password
    );
}
