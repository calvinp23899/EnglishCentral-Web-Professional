using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.PublishExamVersion
{
    public class PublishExamVersionCommandValidator : AbstractValidator<PublishExamVersionCommand>
    {
        public PublishExamVersionCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
