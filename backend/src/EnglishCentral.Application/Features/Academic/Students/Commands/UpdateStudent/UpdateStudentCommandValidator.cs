using FluentValidation;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.UpdateStudent
{
    public class UpdateStudentCommandValidator : AbstractValidator<UpdateStudentCommand>
    {
        public UpdateStudentCommandValidator()
        {
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
        }
    }
}
