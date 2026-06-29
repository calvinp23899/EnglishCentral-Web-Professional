using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamReviews.Commands.ReviewExamAttempt
{
    public class ReviewExamAttemptCommandValidator : AbstractValidator<ReviewExamAttemptCommand>
    {
        public ReviewExamAttemptCommandValidator()
        {
            RuleFor(x => x.AttemptId).GreaterThan(0);
            RuleFor(x => x.ReviewerId).GreaterThan(0).When(x => x.ReviewerId.HasValue);
            RuleFor(x => x.Score).GreaterThanOrEqualTo(0).When(x => x.Score.HasValue);
            RuleForEach(x => x.Responses).SetValidator(new ReviewExamQuestionResponseRequestValidator());
        }
    }

    public class ReviewExamQuestionResponseRequestValidator : AbstractValidator<ReviewExamQuestionResponseRequest>
    {
        public ReviewExamQuestionResponseRequestValidator()
        {
            RuleFor(x => x.ResponseId).GreaterThan(0);
            RuleFor(x => x.Score).GreaterThanOrEqualTo(0).When(x => x.Score.HasValue);
        }
    }
}
