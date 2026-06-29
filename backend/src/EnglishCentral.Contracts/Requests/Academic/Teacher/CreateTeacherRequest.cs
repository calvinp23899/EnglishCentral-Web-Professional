using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Contracts.Requests.Academic.Teacher
{
    public record CreateTeacherRequest(
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

        // === Employment ===
        DateOnly HireDate,
        EContractType? ContractType,
        DateOnly? ContractEndDate,
        ETeacherStatus Status,

        // === Payroll ===
        ESalaryType SalaryType,
        decimal? BaseSalary,
        decimal? HourlyRate,
        string? BankAccountNumber,
        string? BankName,
        string? TaxCode,

        // === Account ===
        bool IsAccountExists,
        TeacherAccountRequest Account
    );

    public record TeacherAccountRequest(
        long? UserId,
        string? Email,
        string? PhoneNumber,
        string? FullName,
        string? Role,
        string? Password
    );
}
