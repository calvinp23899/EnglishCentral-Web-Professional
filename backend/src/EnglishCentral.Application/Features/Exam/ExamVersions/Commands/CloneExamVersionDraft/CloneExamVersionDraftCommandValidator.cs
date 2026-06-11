using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CloneExamVersionDraft
{
    public class CloneExamVersionDraftCommandValidator : AbstractValidator<CloneExamVersionDraftCommand>
    {
        public CloneExamVersionDraftCommandValidator()
        {
            RuleFor(x => x.SourceVersionId).GreaterThan(0);
            RuleFor(x => x.VersionCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.VersionNumber).GreaterThan(0);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(2000);
        }
    }
}
