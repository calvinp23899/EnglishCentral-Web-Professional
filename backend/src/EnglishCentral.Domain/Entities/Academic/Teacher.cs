using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Teacher : BaseEntity
    {
        // === Identity ===
        public long UserId { get; set; }
        public string TeacherCode { get; set; } = default!;

        // === Basic Info ===
        public string FullName { get; set; } = default!;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public string? Address { get; set; }

        // === National ID ==
        public string? NationalId { get; set; }
        public DateOnly? NationalIdIssuedDate { get; set; }
        public string? NationalIdIssuedPlace { get; set; }

        // === Professional ===
        public string? Specialization { get; set; }
        public string? Bio { get; set; }
        public string? Degree { get; set; }
        public int? YearsOfExperience { get; set; }
        public List<string>? CertificationsJson { get; set; }

        // === Employment ===
        public DateOnly? HireDate { get; set; }
        public ContractType? ContractType { get; set; }
        public DateOnly? ContractEndDate { get; set; }
        public TeacherStatus Status { get; set; } = TeacherStatus.Active;

        // === Payroll ===
        public SalaryType SalaryType { get; set; }
        public decimal? BaseSalary { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankName { get; set; }
        public string? TaxCode { get; set; }

        // Navigation
        public User User { get; set; } = default!;
        public ICollection<Class> Classes { get; set; } = [];
        public ICollection<ClassSession> Sessions { get; set; } = [];
    }
}
