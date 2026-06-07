using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamSectionAttempt : BaseEntity
    {
        public long ExamAttemptId { get; set; }

        public long ExamSectionId { get; set; }

        public EExamAttemptStatus Status { get; set; } = EExamAttemptStatus.NotStarted;

        public DateTimeOffset? StartedAt { get; set; }

        public DateTimeOffset? SubmittedAt { get; set; }

        public int? DurationSeconds { get; set; }

        public decimal? RawScore { get; set; }

        public decimal? ScaledScore { get; set; }

        public decimal? BandScore { get; set; }

        public ExamAttempt ExamAttempt { get; set; } = default!;

        public ExamSection ExamSection { get; set; } = default!;

        public ICollection<ExamQuestionResponse> Responses { get; set; } = [];
    }
}
