using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SaveExamResponse
{
    public class SaveExamResponseCommandValidator : AbstractValidator<SaveExamResponseCommand>
    {
        public SaveExamResponseCommandValidator()
        {
            RuleFor(x => x.AttemptId).GreaterThan(0);
            RuleFor(x => x.SectionAttemptId).GreaterThan(0).When(x => x.SectionAttemptId.HasValue);
            RuleFor(x => x.QuestionId).GreaterThan(0);
            RuleFor(x => x.AnswerOptionId).GreaterThan(0).When(x => x.AnswerOptionId.HasValue);
        }
    }
}
