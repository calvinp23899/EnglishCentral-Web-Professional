using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamAnswerOption : BaseEntity
    {
        public long ExamQuestionId { get; set; }

        public string Label { get; set; } = default!;

        public string Content { get; set; } = default!;

        public int OrderIndex { get; set; }

        public string? MetadataJson { get; set; }

        public ExamQuestion ExamQuestion { get; set; } = default!;

        public ICollection<ExamAnswerKey> AnswerKeys { get; set; } = [];

        public ICollection<ExamQuestionResponse> Responses { get; set; } = [];
    }
}
