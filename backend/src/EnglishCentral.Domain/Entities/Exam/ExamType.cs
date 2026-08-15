using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamType : BaseEntity
    {
        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public EExamFamily Family { get; set; } = EExamFamily.Custom;

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsSytemDefault { get; set; } = false;

        public ICollection<ExamTemplate> Templates { get; set; } = [];
    }
}
