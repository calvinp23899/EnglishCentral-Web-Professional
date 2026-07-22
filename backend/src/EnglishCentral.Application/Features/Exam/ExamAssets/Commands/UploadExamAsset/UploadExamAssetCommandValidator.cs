using EnglishCentral.Domain.Enums.Exam;
using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UploadExamAsset
{
    public class UploadExamAssetCommandValidator : AbstractValidator<UploadExamAssetCommand>
    {
        private const long MaxFileSizeInBytes = 100 * 1024 * 1024;
        private static readonly string[] AudioExtensions = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".webm"];
        private static readonly string[] ImageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
        private static readonly string[] VideoExtensions = [".mp4", ".webm", ".mov"];
        private static readonly string[] DocumentExtensions = [".pdf", ".doc", ".docx"];

        public UploadExamAssetCommandValidator()
        {
            RuleFor(x => x.FileStream).NotNull();
            RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
            RuleFor(x => x.AssetType).IsInEnum();
            RuleFor(x => x.DurationSeconds).GreaterThan(0).When(x => x.DurationSeconds.HasValue);
            RuleFor(x => x.Size)
                .GreaterThan(0)
                .LessThanOrEqualTo(MaxFileSizeInBytes)
                .WithMessage("Asset file must be 100MB or smaller.");

            RuleFor(x => x.FileName)
                .Must((command, fileName) => HasAllowedExtension(command.AssetType, fileName))
                .WithMessage("Asset file extension is not supported for the selected asset type.");
        }

        private static bool HasAllowedExtension(EExamAssetType assetType, string fileName)
        {
            var extension = Path.GetExtension(fileName);
            var allowedExtensions = assetType switch
            {
                EExamAssetType.Audio => AudioExtensions,
                EExamAssetType.Image => ImageExtensions,
                EExamAssetType.Video => VideoExtensions,
                EExamAssetType.Document => DocumentExtensions,
                _ => AudioExtensions.Concat(ImageExtensions).Concat(VideoExtensions).Concat(DocumentExtensions).ToArray()
            };

            return allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase);
        }
    }
}
