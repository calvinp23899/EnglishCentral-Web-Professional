using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamStimulus : BaseEntity
    {
        public long ExamPartId { get; set; }

        public EExamStimulusType Type { get; set; } = EExamStimulusType.Text;

        public string? Title { get; set; }

        public string? Content { get; set; }

        public string? AssetUrl { get; set; }

        public string? Transcript { get; set; }

        public int OrderIndex { get; set; }

        public string? MetadataJson { get; set; }

        public ExamPart ExamPart { get; set; } = default!;

        public ICollection<ExamQuestionGroup> QuestionGroups { get; set; } = [];
    }
}
