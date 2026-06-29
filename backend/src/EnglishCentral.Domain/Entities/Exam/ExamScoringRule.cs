using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamScoringRule : BaseEntity
    {
        public long ExamVersionId { get; set; }

        public long? ExamSectionId { get; set; }

        public EExamSkill? Skill { get; set; }

        public EExamQuestionType? QuestionType { get; set; }

        public string RuleCode { get; set; } = default!;

        public string Name { get; set; } = default!;

        public decimal? MaxScore { get; set; }

        public string ConfigJson { get; set; } = default!;

        public ExamVersion ExamVersion { get; set; } = default!;

        public ExamSection? ExamSection { get; set; }
    }
}
