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
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt,
        DateTimeOffset? deletedAt,
        List<string> RolesName,
        TeacherAccount? Account
    );

    public record TeacherAccount(
        long AccountId,
        string AccountEmail,
        bool IsActive
    );
}
