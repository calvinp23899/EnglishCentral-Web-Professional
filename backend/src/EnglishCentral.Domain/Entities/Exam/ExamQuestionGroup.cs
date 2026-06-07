using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamQuestionGroup : BaseEntity
    {
        public long ExamPartId { get; set; }

        public long? ExamStimulusId { get; set; }

        public string Code { get; set; } = default!;

        public string? Title { get; set; }

        public string? Instructions { get; set; }

        public EExamQuestionType QuestionType { get; set; }

        public int OrderIndex { get; set; }

        public string? ConfigJson { get; set; }

        public ExamPart ExamPart { get; set; } = default!;

        public ExamStimulus? ExamStimulus { get; set; }

        public ICollection<ExamQuestion> Questions { get; set; } = [];
    }
}
