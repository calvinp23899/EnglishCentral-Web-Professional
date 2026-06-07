using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.CreateExamType
{
    public class CreateExamTypeCommandValidator : AbstractValidator<CreateExamTypeCommand>
    {
        public CreateExamTypeCommandValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Family).IsInEnum();
            RuleFor(x => x.Description).MaximumLength(2000);
        }
    }
}
