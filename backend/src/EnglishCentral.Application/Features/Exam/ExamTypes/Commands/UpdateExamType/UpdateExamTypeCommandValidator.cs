using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.UpdateExamType
{
    public class UpdateExamTypeCommandValidator : AbstractValidator<UpdateExamTypeCommand>
    {
        public UpdateExamTypeCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Family).IsInEnum();
            RuleFor(x => x.Description).MaximumLength(2000);
        }
    }
}
