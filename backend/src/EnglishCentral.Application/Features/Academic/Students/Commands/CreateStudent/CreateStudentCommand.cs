using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.CreateStudent
{
    public record CreateStudentCommand(
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
        StudentAccountDto Account
    ) : IRequest<Result<StudentResponse>>;

    public record StudentAccountDto(
        long? UserId,
        string? Email,
        string? PhoneNumber,
        string? FullName,
        string? Password
    );
}
