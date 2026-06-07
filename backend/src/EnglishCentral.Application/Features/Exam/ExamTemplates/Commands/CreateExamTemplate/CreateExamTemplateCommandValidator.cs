using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.CreateExamTemplate
{
    public class CreateExamTemplateCommandValidator : AbstractValidator<CreateExamTemplateCommand>
    {
        public CreateExamTemplateCommandValidator()
        {
            RuleFor(x => x.ExamTypeId).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(2000);
            RuleFor(x => x.DurationMinutes).GreaterThan(0).When(x => x.DurationMinutes.HasValue);
            RuleFor(x => x.TotalScore).GreaterThan(0).When(x => x.TotalScore.HasValue);
        }
    }
}
