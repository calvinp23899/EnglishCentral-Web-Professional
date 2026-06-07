using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.DeleteExamTemplate
{
    public class DeleteExamTemplateCommandValidator : AbstractValidator<DeleteExamTemplateCommand>
    {
        public DeleteExamTemplateCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
