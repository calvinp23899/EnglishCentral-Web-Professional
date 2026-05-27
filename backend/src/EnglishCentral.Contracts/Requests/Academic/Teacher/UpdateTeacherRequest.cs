using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Contracts.Requests.Academic.Teacher
{
    public record UpdateTeacherRequest(
        string FullName,
        string? Email,
        string? PhoneNumber,
        DateOnly? DateOfBirth,
        Gender Gender,
        string? Address,
        string? NationalId,
        DateOnly? NationalIdIssuedDate,
        string? NationalIdIssuedPlace,
        string? Specialization,
        string? Bio,
        string? Degree,
        int? YearsOfExperience,
        List<string>? Certifications,
        DateOnly HireDate,
        ContractType? ContractType,
        DateOnly? ContractEndDate,
        TeacherStatus Status,
        SalaryType SalaryType,
        decimal? BaseSalary,
        decimal? HourlyRate,
        string? BankAccountNumber,
        string? BankName,
        string? TaxCode
    );
}
