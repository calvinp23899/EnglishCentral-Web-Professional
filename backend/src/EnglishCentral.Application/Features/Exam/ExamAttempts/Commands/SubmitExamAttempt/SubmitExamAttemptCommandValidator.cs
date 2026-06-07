using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttempt
{
    public class SubmitExamAttemptCommandValidator : AbstractValidator<SubmitExamAttemptCommand>
    {
        public SubmitExamAttemptCommandValidator()
        {
            RuleFor(x => x.AttemptId).GreaterThan(0);
        }
    }
}
