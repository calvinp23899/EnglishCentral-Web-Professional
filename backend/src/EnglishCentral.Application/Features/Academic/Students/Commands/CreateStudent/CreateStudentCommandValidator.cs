using FluentValidation;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.CreateStudent
{
    public class CreateStudentCommandValidator : AbstractValidator<CreateStudentCommand>
    {
        public CreateStudentCommandValidator()
        {
            RuleFor(x => x.StudentCode)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.FullName)
                .NotEmpty()
                .MaximumLength(255);

            RuleFor(x => x.Email)
                .EmailAddress()
                .MaximumLength(255)
                .When(x => !string.IsNullOrWhiteSpace(x.Email));

            RuleFor(x => x.PhoneNumber)
                .MaximumLength(20);

            RuleFor(x => x.ParentPhoneNumber)
                .MaximumLength(20);

            RuleFor(x => x.Address)
                .MaximumLength(500);

            RuleFor(x => x.Gender)
                .IsInEnum();

            RuleFor(x => x.Status)
                .IsInEnum();

            RuleFor(x => x.EnrollmentDate)
                .NotEmpty();
            When(x => x.IsAccountExists, () =>
            {
                RuleFor(x => x.Account.UserId)
                    .NotNull()
                    .WithMessage("UserId is required when account exists.");

                RuleFor(x => x.Account.Email)
                    .Null();

                RuleFor(x => x.Account.PhoneNumber)
                    .Null();

                RuleFor(x => x.Account.FullName)
                    .Null();

                RuleFor(x => x.Account.Password)
                    .Null();
            });

            When(x => !x.IsAccountExists, () =>
            {
                RuleFor(x => x.Account.UserId)
                    .Null()
                    .WithMessage("UserId must be null when creating new account.");

                RuleFor(x => x.Account.Email)
                    .NotEmpty()
                    .EmailAddress();

                RuleFor(x => x.Account.PhoneNumber)
                    .NotEmpty();

                RuleFor(x => x.Account.FullName)
                    .NotEmpty();

                RuleFor(x => x.Account.Password)
                    .NotEmpty()
                    .MinimumLength(6);
            });
        }
    }
}
