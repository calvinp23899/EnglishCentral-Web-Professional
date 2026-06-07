using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamVersion : BaseEntity
    {
        public long ExamTemplateId { get; set; }

        public string VersionCode { get; set; } = default!;

        public int VersionNumber { get; set; }

        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        public EExamTemplateStatus Status { get; set; } = EExamTemplateStatus.Draft;

        public int? DurationMinutes { get; set; }

        public decimal? TotalScore { get; set; }

        public EExamScoringMode ScoringMode { get; set; } = EExamScoringMode.Auto;

        public string? RuntimeConfigJson { get; set; }

        public string? ScoringConfigJson { get; set; }

        public DateTimeOffset? PublishedAt { get; set; }

        public ExamTemplate ExamTemplate { get; set; } = default!;

        public ICollection<ExamSection> Sections { get; set; } = [];

        public ICollection<ExamScoringRule> ScoringRules { get; set; } = [];

        public ICollection<ExamAttempt> Attempts { get; set; } = [];
    }
}
