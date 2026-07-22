using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.DeleteExamAsset
{
    public class DeleteExamAssetCommandValidator : AbstractValidator<DeleteExamAssetCommand>
    {
        public DeleteExamAssetCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
