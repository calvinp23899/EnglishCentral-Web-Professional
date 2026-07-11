using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttemptWithAnswers
{
    public class SubmitExamAttemptWithAnswersCommandValidator : AbstractValidator<SubmitExamAttemptWithAnswersCommand>
    {
        public SubmitExamAttemptWithAnswersCommandValidator()
        {
            RuleFor(x => x.ExamVersionId).GreaterThan(0);
            RuleFor(x => x.StudentId).GreaterThan(0).When(x => x.StudentId.HasValue);
            RuleFor(x => x.CandidateName).MaximumLength(255);
            RuleFor(x => x.CandidateEmail).MaximumLength(255);
            RuleFor(x => x.Mode).IsInEnum().When(x => x.Mode.HasValue);
            RuleFor(x => x.Answers).NotNull();
            RuleForEach(x => x.Answers).SetValidator(new SubmitExamAnswerRequestValidator());
        }
    }

    public class SubmitExamAnswerRequestValidator : AbstractValidator<SubmitExamAnswerRequest>
    {
        public SubmitExamAnswerRequestValidator()
        {
            RuleFor(x => x.QuestionId).GreaterThan(0);
            RuleFor(x => x.AnswerOptionId).GreaterThan(0).When(x => x.AnswerOptionId.HasValue);
        }
    }
}
