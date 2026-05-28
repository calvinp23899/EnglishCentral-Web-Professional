using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.CreateTeacher
{
    public record CreateTeacherCommand(
        string FullName,
        string? Email,
        string? PhoneNumber,
        DateOnly? DateOfBirth,
        EGender Gender,
        string? Address,
        string? NationalId,
        DateOnly? NationalIdIssuedDate,
        string? NationalIdIssuedPlace,
        string? Specialization,
        string? Bio,
        string? Degree,
        int? YearsOfExperience,
        List<string>? Certifications,
        DateOnly? HireDate,
        EContractType? ContractType,
        DateOnly? ContractEndDate,
        ETeacherStatus Status,
        ESalaryType SalaryType,
        decimal? BaseSalary,
        decimal? HourlyRate,
        string? BankAccountNumber,
        string? BankName,
        string? TaxCode,
        bool IsAccountExists,
        TeacherAccountDto Account
    ) : IRequest<Result<TeacherResponse>>;

    public record TeacherAccountDto(
        long? UserId,
        string? Email,
        string? PhoneNumber,
        string? FullName,
        string? Password
    );
}
