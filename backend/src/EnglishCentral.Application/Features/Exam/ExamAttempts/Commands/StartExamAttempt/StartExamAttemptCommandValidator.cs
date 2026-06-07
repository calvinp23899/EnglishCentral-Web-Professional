using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.StartExamAttempt
{
    public class StartExamAttemptCommandValidator : AbstractValidator<StartExamAttemptCommand>
    {
        public StartExamAttemptCommandValidator()
        {
            RuleFor(x => x.ExamVersionId).GreaterThan(0);
            RuleFor(x => x.StudentId).GreaterThan(0).When(x => x.StudentId.HasValue);
            RuleFor(x => x.CandidateName).MaximumLength(255);
            RuleFor(x => x.CandidateEmail).MaximumLength(255).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.CandidateEmail));
        }
    }
}
