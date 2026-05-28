using FluentValidation;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.CreateStudent
{
    public class CreateStudentCommandValidator : AbstractValidator<CreateStudentCommand>
    {
        public CreateStudentCommandValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .MaximumLength(255);

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress()
                .MaximumLength(255)
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.PhoneNumber)
                .NotEmpty()
                .MaximumLength(20);

            RuleFor(x => x.ParentPhoneNumber)
                .MaximumLength(20);

            RuleFor(x => x.Address)
                .MaximumLength(500);

            RuleFor(x => x.Gender)
                .NotEmpty()
                .IsInEnum();

            RuleFor(x => x.Status)
                .NotEmpty()
                .IsInEnum();

            RuleFor(x => x.EnrollmentDate)
                .NotEmpty();
            When(x => x.IsAccountExists, () =>
            {
                RuleFor(x => x.Account.UserId)
                    .NotNull()
                    .WithMessage("UserId is required when account exists.");
            });

            When(x => !x.IsAccountExists, () =>
            {
                RuleFor(x => x.Account.UserId)
                    .Null()
                    .WithMessage("UserId must be null when creating new account.");

                RuleFor(x => x.Account.Password)
                    .NotEmpty()
                    .MinimumLength(6);
            });
        }
    }
}
