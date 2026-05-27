using FluentValidation;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.CreateTeacher
{
    public class CreateTeacherCommandValidator : AbstractValidator<CreateTeacherCommand>
    {
        public CreateTeacherCommandValidator()
        {
            // === Basic Info ===
            RuleFor(x => x.FullName)
                .NotEmpty()
                .MaximumLength(255);

            RuleFor(x => x.Email)
                .EmailAddress()
                .MaximumLength(255)
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.PhoneNumber)
                .MaximumLength(20)
                .Matches(@"^\+?[0-9\s\-\(\)]+$")
                .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber));

            RuleFor(x => x.DateOfBirth)
                .LessThan(DateOnly.FromDateTime(DateTime.Today))
                .When(x => x.DateOfBirth.HasValue);

            RuleFor(x => x.Gender)
                .IsInEnum();

            RuleFor(x => x.Address)
                .MaximumLength(500);

            // === National ID ===
            RuleFor(x => x.NationalId)
                .MaximumLength(50);

            RuleFor(x => x.NationalIdIssuedPlace)
                .MaximumLength(255);

            RuleFor(x => x.NationalIdIssuedDate)
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today))
                .When(x => x.NationalIdIssuedDate.HasValue);

            // === Professional ===
            RuleFor(x => x.Specialization)
                .MaximumLength(255);

            RuleFor(x => x.Bio)
                .MaximumLength(2000);

            RuleFor(x => x.Degree)
                .MaximumLength(255);

            RuleFor(x => x.YearsOfExperience)
                .GreaterThanOrEqualTo(0)
                .LessThanOrEqualTo(60)
                .When(x => x.YearsOfExperience.HasValue);

            RuleForEach(x => x.Certifications)
                .NotEmpty()
                .MaximumLength(255)
                .When(x => x.Certifications != null && x.Certifications.Count > 0);

            // === Employment ===
            RuleFor(x => x.HireDate)
                .NotEmpty();

            RuleFor(x => x.ContractType)
                .IsInEnum()
                .When(x => x.ContractType.HasValue);

            RuleFor(x => x.ContractEndDate)
                .GreaterThan(x => x.HireDate!)
                .WithMessage("ContractEndDate must be after HireDate.")
                .When(x => x.ContractEndDate.HasValue && x.HireDate.HasValue);

            // === Payroll ===
            RuleFor(x => x.SalaryType)
                .IsInEnum();

            RuleFor(x => x.BaseSalary)
                .GreaterThanOrEqualTo(0)
                .When(x => x.BaseSalary.HasValue);

            RuleFor(x => x.HourlyRate)
                .GreaterThanOrEqualTo(0)
                .When(x => x.HourlyRate.HasValue);

            RuleFor(x => x.BankAccountNumber)
                .MaximumLength(50);

            RuleFor(x => x.BankName)
                .MaximumLength(255);

            RuleFor(x => x.TaxCode)
                .MaximumLength(50);

            // === Account ===
            When(x => x.IsAccountExists, () =>
            {
                RuleFor(x => x.Account.UserId)
                    .NotNull()
                    .WithMessage("UserId is required when using an existing account.");
            });

            When(x => !x.IsAccountExists, () =>
            {
                RuleFor(x => x.Account.Email)
                    .NotEmpty()
                    .EmailAddress()
                    .MaximumLength(255);

                RuleFor(x => x.Account.FullName)
                    .NotEmpty()
                    .MaximumLength(255);

                RuleFor(x => x.Account.Password)
                    .NotEmpty()
                    .MinimumLength(6);
            });
        }
    }
}
