using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.UpdateStudent
{
    public record UpdateStudentCommand(
        long Id,
        string FullName,
        DateOnly? DateOfBirth,
        Gender Gender,
        string? Email,
        string? PhoneNumber,
        string? Address,
        string? ParentName,
        string? ParentPhoneNumber,
        //DateOnly EnrollmentDate,
        StudentStatus Status,
        string? Notes
    ) : IRequest<Result<StudentResponse>>;
}
