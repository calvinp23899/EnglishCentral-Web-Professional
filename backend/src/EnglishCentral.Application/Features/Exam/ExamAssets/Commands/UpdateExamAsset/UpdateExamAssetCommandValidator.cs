using EnglishCentral.Domain.Enums.Exam;
using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UpdateExamAsset
{
    public class UpdateExamAssetCommandValidator : AbstractValidator<UpdateExamAssetCommand>
    {
        public UpdateExamAssetCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.OriginalFileName).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Status).IsInEnum().NotEqual(EExamAssetStatus.Deleted);
            RuleFor(x => x.DurationSeconds).GreaterThan(0).When(x => x.DurationSeconds.HasValue);
        }
    }
}
