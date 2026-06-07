using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamPart : BaseEntity
    {
        public long ExamSectionId { get; set; }

        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public int OrderIndex { get; set; }

        public string? Instructions { get; set; }

        public string? LayoutConfigJson { get; set; }

        public ExamSection ExamSection { get; set; } = default!;

        public ICollection<ExamStimulus> Stimuli { get; set; } = [];

        public ICollection<ExamQuestionGroup> QuestionGroups { get; set; } = [];
    }
}
