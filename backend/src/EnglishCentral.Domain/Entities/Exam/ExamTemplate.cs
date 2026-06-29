using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamTemplate : BaseEntity
    {
        public long ExamTypeId { get; set; }

        public long? CurrentVersionId { get; set; }

        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        public int? DurationMinutes { get; set; }

        public decimal? TotalScore { get; set; }

        public EExamTemplateStatus Status { get; set; } = EExamTemplateStatus.Draft;

        public bool IsActive { get; set; } = true;

        public ExamType ExamType { get; set; } = default!;

        public ExamVersion? CurrentVersion { get; set; }

        public ICollection<ExamVersion> Versions { get; set; } = [];
    }
}
