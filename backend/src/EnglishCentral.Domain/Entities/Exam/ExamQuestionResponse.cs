using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamQuestionResponse : BaseEntity
    {
        public long ExamAttemptId { get; set; }

        public long? ExamSectionAttemptId { get; set; }

        public long ExamQuestionId { get; set; }

        public long? ExamAnswerOptionId { get; set; }

        public string? AnswerText { get; set; }

        public string? AnswerJson { get; set; }

        public decimal? Score { get; set; }

        public bool? IsCorrect { get; set; }

        public EExamReviewStatus ReviewStatus { get; set; } = EExamReviewStatus.Pending;

        public string? Feedback { get; set; }

        public DateTimeOffset? AnsweredAt { get; set; }

        public ExamAttempt ExamAttempt { get; set; } = default!;

        public ExamSectionAttempt? ExamSectionAttempt { get; set; }

        public ExamQuestion ExamQuestion { get; set; } = default!;

        public ExamAnswerOption? ExamAnswerOption { get; set; }
    }
}
