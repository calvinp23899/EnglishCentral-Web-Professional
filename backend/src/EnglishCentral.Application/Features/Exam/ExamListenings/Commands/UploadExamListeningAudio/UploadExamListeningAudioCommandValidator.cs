using FluentValidation;

namespace EnglishCentral.Application.Features.Exam.ExamListenings.Commands.UploadExamListeningAudio
{
    public class UploadExamListeningAudioCommandValidator : AbstractValidator<UploadExamListeningAudioCommand>
    {
        private const long MaxFileSizeInBytes = 100 * 1024 * 1024;
        private static readonly string[] AllowedExtensions = [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".webm"];

        public UploadExamListeningAudioCommandValidator()
        {
            RuleFor(x => x.FileStream).NotNull();
            RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Size)
                .GreaterThan(0)
                .LessThanOrEqualTo(MaxFileSizeInBytes)
                .WithMessage("Audio file must be 100MB or smaller.");

            RuleFor(x => x.FileName)
                .Must(HasAllowedExtension)
                .WithMessage("Audio file extension must be one of: .mp3, .wav, .m4a, .aac, .ogg, .webm.");
        }

        private static bool HasAllowedExtension(string fileName)
        {
            var extension = Path.GetExtension(fileName);
            return AllowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase);
        }
    }
}
