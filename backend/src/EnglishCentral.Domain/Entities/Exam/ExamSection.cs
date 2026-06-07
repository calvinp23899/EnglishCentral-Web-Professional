using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamSection : BaseEntity
    {
        public long ExamVersionId { get; set; }

        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public EExamSkill Skill { get; set; }

        public int OrderIndex { get; set; }

        public int? DurationMinutes { get; set; }

        public decimal? MaxScore { get; set; }

        public string? Instructions { get; set; }

        public string? RuntimeConfigJson { get; set; }

        public ExamVersion ExamVersion { get; set; } = default!;

        public ICollection<ExamPart> Parts { get; set; } = [];

        public ICollection<ExamSectionAttempt> SectionAttempts { get; set; } = [];
    }
}
