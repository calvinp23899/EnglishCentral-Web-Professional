using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.CreateStudent
{
    public record CreateStudentCommand(
        string FullName,
        DateOnly? DateOfBirth,
        EGender Gender,
        string Email,
        string PhoneNumber,
        string Address,
        string? ParentName,
        string? ParentPhoneNumber,
        DateOnly EnrollmentDate,
        EStatus Status,
        string? Notes,
        bool IsAccountExists,
        StudentAccountDto Account
    ) : IRequest<Result<StudentResponse>>;

    public record StudentAccountDto(
        long? UserId,
        string? Password
    );
}
