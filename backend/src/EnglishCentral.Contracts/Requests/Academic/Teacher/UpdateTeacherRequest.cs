using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Contracts.Requests.Academic.Teacher
{
    public record UpdateTeacherRequest(
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
    );
}
