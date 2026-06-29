using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CreateExamVersion
{
    public class CreateExamVersionCommandValidator : AbstractValidator<CreateExamVersionCommand>
    {
        public CreateExamVersionCommandValidator()
        {
            RuleFor(x => x.ExamTemplateId).GreaterThan(0);
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

    public class CreateExamSectionRequestValidator : AbstractValidator<CreateExamSectionRequest>
    {
        public CreateExamSectionRequestValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Skill).IsInEnum();
            RuleFor(x => x.OrderIndex).GreaterThan(0);
            RuleFor(x => x.Parts).NotEmpty();
            RuleForEach(x => x.Parts).SetValidator(new CreateExamPartRequestValidator());
        }
    }

    public class CreateExamPartRequestValidator : AbstractValidator<CreateExamPartRequest>
    {
        public CreateExamPartRequestValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.OrderIndex).GreaterThan(0);
            RuleFor(x => x.QuestionGroups).NotEmpty();
            RuleForEach(x => x.Stimuli).SetValidator(new CreateExamStimulusRequestValidator());
            RuleForEach(x => x.QuestionGroups).SetValidator(new CreateExamQuestionGroupRequestValidator());
        }
    }

    public class CreateExamStimulusRequestValidator : AbstractValidator<CreateExamStimulusRequest>
    {
        public CreateExamStimulusRequestValidator()
        {
            RuleFor(x => x.ClientKey).NotEmpty().MaximumLength(80);
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.Title).MaximumLength(255);
            RuleFor(x => x.AssetUrl).MaximumLength(1000);
            RuleFor(x => x.OrderIndex).GreaterThan(0);
        }
    }

    public class CreateExamQuestionGroupRequestValidator : AbstractValidator<CreateExamQuestionGroupRequest>
    {
        public CreateExamQuestionGroupRequestValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.QuestionType).IsInEnum();
            RuleFor(x => x.OrderIndex).GreaterThan(0);
            RuleFor(x => x.Questions).NotEmpty();
            RuleForEach(x => x.Questions).SetValidator(new CreateExamQuestionRequestValidator());
        }
    }

    public class CreateExamQuestionRequestValidator : AbstractValidator<CreateExamQuestionRequest>
    {
        public CreateExamQuestionRequestValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.QuestionType).IsInEnum();
            RuleFor(x => x.OrderIndex).GreaterThan(0);
            RuleFor(x => x.Points).GreaterThanOrEqualTo(0);
            RuleForEach(x => x.AnswerOptions).SetValidator(new CreateExamAnswerOptionRequestValidator());
            RuleForEach(x => x.AnswerKeys).SetValidator(new CreateExamAnswerKeyRequestValidator());
        }
    }

    public class CreateExamAnswerOptionRequestValidator : AbstractValidator<CreateExamAnswerOptionRequest>
    {
        public CreateExamAnswerOptionRequestValidator()
        {
            RuleFor(x => x.ClientKey).NotEmpty().MaximumLength(80);
            RuleFor(x => x.Label).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Content).NotEmpty();
            RuleFor(x => x.OrderIndex).GreaterThan(0);
        }
    }

    public class CreateExamAnswerKeyRequestValidator : AbstractValidator<CreateExamAnswerKeyRequest>
    {
        public CreateExamAnswerKeyRequestValidator()
        {
            RuleFor(x => x.Score).GreaterThanOrEqualTo(0);
            RuleFor(x => x.OrderIndex).GreaterThan(0);
        }
    }

    public class CreateExamScoringRuleRequestValidator : AbstractValidator<CreateExamScoringRuleRequest>
    {
        public CreateExamScoringRuleRequestValidator()
        {
            RuleFor(x => x.RuleCode).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Skill).IsInEnum().When(x => x.Skill.HasValue);
            RuleFor(x => x.QuestionType).IsInEnum().When(x => x.QuestionType.HasValue);
            RuleFor(x => x.MaxScore).GreaterThan(0).When(x => x.MaxScore.HasValue);
            RuleFor(x => x.ConfigJson).NotEmpty();
        }
    }
}
