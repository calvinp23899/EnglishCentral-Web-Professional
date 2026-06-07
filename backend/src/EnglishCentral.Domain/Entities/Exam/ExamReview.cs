using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamReview : BaseEntity
    {
        public long ExamAttemptId { get; set; }

        public long? ReviewerId { get; set; }

        public EExamReviewStatus Status { get; set; } = EExamReviewStatus.Pending;

        public decimal? Score { get; set; }

        public string? Feedback { get; set; }

        public string? RubricJson { get; set; }

        public DateTimeOffset? ReviewedAt { get; set; }

        public ExamAttempt ExamAttempt { get; set; } = default!;
    }
}
