using EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CreateExamVersion;
using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.UpdateExamVersionDraft
{
    public class UpdateExamVersionDraftCommandValidator : AbstractValidator<UpdateExamVersionDraftCommand>
    {
        public UpdateExamVersionDraftCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.VersionCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.VersionNumber).GreaterThan(0);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(2000);
            RuleFor(x => x.DurationMinutes).GreaterThan(0).When(x => x.DurationMinutes.HasValue);
            RuleFor(x => x.TotalScore).GreaterThan(0).When(x => x.TotalScore.HasValue);
            RuleFor(x => x.ScoringMode).IsInEnum();
            RuleFor(x => x.Sections).NotEmpty();
            RuleForEach(x => x.Sections).SetValidator(new CreateExamSectionRequestValidator());
            RuleForEach(x => x.ScoringRules).SetValidator(new CreateExamScoringRuleRequestValidator());
        }
    }
}
