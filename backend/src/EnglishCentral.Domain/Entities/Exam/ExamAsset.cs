using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamAsset : BaseEntity
    {
        public EExamAssetType AssetType { get; set; } = EExamAssetType.Audio;

        public EExamAssetProvider Provider { get; set; } = EExamAssetProvider.CloudflareR2;

        public EExamAssetStatus Status { get; set; } = EExamAssetStatus.Uploaded;

        public string BucketName { get; set; } = default!;

        public string ObjectKey { get; set; } = default!;

        public string PublicUrl { get; set; } = default!;

        public string OriginalFileName { get; set; } = default!;

        public string ContentType { get; set; } = default!;

        public long FileSize { get; set; }

        public string? Checksum { get; set; }

        public int? DurationSeconds { get; set; }

        public string? MetadataJson { get; set; }

        public ICollection<ExamStimulus> Stimuli { get; set; } = [];
    }
}
