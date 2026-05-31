using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.Teachers.DTOs
{
    public record TeacherResponse(
        Guid PublicId,
        long Id,
        string TeacherCode,
        string FullName,
        string? Email,
        string? PhoneNumber,
        DateOnly? DateOfBirth,
        int Gender,
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
        int Status,
        int SalaryType,
        decimal? BaseSalary,
        decimal? HourlyRate,
        string? BankAccountNumber,
        string? BankName,
        string? TaxCode,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt,
        TeacherAccount? Account
    );

    public record TeacherAccount(
        long AccountId,
        string AccountEmail,
        bool IsActive
    );
}
