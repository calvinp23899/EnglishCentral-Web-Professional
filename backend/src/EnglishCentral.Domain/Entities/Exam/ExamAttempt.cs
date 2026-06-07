using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Exam;

namespace EnglishCentral.Domain.Entities.Exam
{
    public class ExamAttempt : BaseEntity
    {
        public long ExamVersionId { get; set; }

        public long? StudentId { get; set; }

        public string AttemptCode { get; set; } = default!;

        public string? CandidateName { get; set; }

        public string? CandidateEmail { get; set; }

        public EExamAttemptStatus Status { get; set; } = EExamAttemptStatus.NotStarted;

        public DateTimeOffset? StartedAt { get; set; }

        public DateTimeOffset? SubmittedAt { get; set; }

        public DateTimeOffset? CompletedAt { get; set; }

        public int? DurationSeconds { get; set; }

        public decimal? RawScore { get; set; }

        public decimal? ScaledScore { get; set; }

        public decimal? BandScore { get; set; }

        public string? ResultLevel { get; set; }

        public string? RuntimeStateJson { get; set; }

        public ExamVersion ExamVersion { get; set; } = default!;

        public Student? Student { get; set; }

        public ICollection<ExamSectionAttempt> SectionAttempts { get; set; } = [];

        public ICollection<ExamQuestionResponse> Responses { get; set; } = [];

        public ICollection<ExamReview> Reviews { get; set; } = [];
    }
}
