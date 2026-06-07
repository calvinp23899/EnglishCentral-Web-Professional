using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Commands.DeleteExamType
{
    public class DeleteExamTypeCommandValidator : AbstractValidator<DeleteExamTypeCommand>
    {
        public DeleteExamTypeCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
