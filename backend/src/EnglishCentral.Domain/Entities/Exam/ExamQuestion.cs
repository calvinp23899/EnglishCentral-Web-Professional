using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamQuestion : BaseEntity
    {
        public long ExamQuestionGroupId { get; set; }

        public string Code { get; set; } = default!;

        public string? Prompt { get; set; }

        public EExamQuestionType QuestionType { get; set; }

        public int OrderIndex { get; set; }

        public decimal Points { get; set; } = 1;

        public bool IsRequired { get; set; } = true;

        public string? Explanation { get; set; }

        public string? MetadataJson { get; set; }

        public ExamQuestionGroup ExamQuestionGroup { get; set; } = default!;

        public ICollection<ExamAnswerOption> AnswerOptions { get; set; } = [];

        public ICollection<ExamAnswerKey> AnswerKeys { get; set; } = [];

        public ICollection<ExamQuestionResponse> Responses { get; set; } = [];
    }
}
