using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.UpdateTeacher
{
    public record UpdateTeacherCommand(
    long TeacherId,

    // === Basic Info ===
    string FullName,
    string? Email,
    string? PhoneNumber,
    DateOnly? DateOfBirth,
    EGender Gender,
    string? Address,

    // === National ID ===
    string? NationalId,
    DateOnly? NationalIdIssuedDate,
    string? NationalIdIssuedPlace,

    // === Professional ===
    string? Specialization,
    string? Bio,
    string? Degree,
    int? YearsOfExperience,
    List<string>? Certifications,

    DateOnly HireDate,
    EContractType? ContractType,
    DateOnly? ContractEndDate,
    ETeacherStatus Status,

    ESalaryType SalaryType,
    decimal? BaseSalary,
    decimal? HourlyRate,
    string? BankAccountNumber,
    string? BankName,
    string? TaxCode
) : IRequest<Result<TeacherResponse>>;
}
