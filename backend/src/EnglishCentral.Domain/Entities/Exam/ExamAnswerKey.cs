using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamAnswerKey : BaseEntity
    {
        public long ExamQuestionId { get; set; }

        public long? ExamAnswerOptionId { get; set; }

        public string? CorrectValue { get; set; }

        public string? MatchPattern { get; set; }

        public decimal Score { get; set; } = 1;

        public bool CaseSensitive { get; set; }

        public int OrderIndex { get; set; }

        public ExamQuestion ExamQuestion { get; set; } = default!;

        public ExamAnswerOption? ExamAnswerOption { get; set; }
    }
}
