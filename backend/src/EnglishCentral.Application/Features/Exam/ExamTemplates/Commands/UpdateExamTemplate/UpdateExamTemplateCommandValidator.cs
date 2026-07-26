using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.UpdateExamTemplate
{
    public class UpdateExamTemplateCommandValidator : AbstractValidator<UpdateExamTemplateCommand>
    {
        public UpdateExamTemplateCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(2000);
            RuleFor(x => x.DurationMinutes).GreaterThan(0).When(x => x.DurationMinutes.HasValue);
            RuleFor(x => x.TotalScore).GreaterThan(0).When(x => x.TotalScore.HasValue);
            RuleFor(x => x.TemplateConfigJson!.SourceLabel).MaximumLength(255).When(x => x.TemplateConfigJson is not null);
            RuleFor(x => x.TemplateConfigJson!.Level).MaximumLength(100).When(x => x.TemplateConfigJson is not null);
            RuleFor(x => x.TemplateConfigJson!.Skill).MaximumLength(50).When(x => x.TemplateConfigJson is not null);
            RuleFor(x => x.TemplateConfigJson!.TotalParts).GreaterThan(0).When(x => x.TemplateConfigJson?.TotalParts is not null);
        }
    }
}
