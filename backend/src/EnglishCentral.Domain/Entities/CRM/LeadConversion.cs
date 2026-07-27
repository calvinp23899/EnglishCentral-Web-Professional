using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Domain.Entities.CRM
{
    public class LeadConversion : BaseEntity
    {
        public long LeadId { get; set; }

        public long StudentId { get; set; }

        public long? EnrollmentId { get; set; }

        public long ConvertedByUserId { get; set; }

        public DateTimeOffset ConvertedAt { get; set; } = DateTimeOffset.UtcNow;

        public long? SourceIdSnapshot { get; set; }

        public string? SourceNameSnapshot { get; set; }

        public string? ChannelSnapshot { get; set; }

        public long? CourseIdSnapshot { get; set; }

        public string? CourseNameSnapshot { get; set; }

        public decimal? RevenueSnapshot { get; set; }

        public string? Note { get; set; }

        public Lead Lead { get; set; } = default!;

        public Student Student { get; set; } = default!;

        public Enrollment? Enrollment { get; set; }

        public User ConvertedByUser { get; set; } = default!;
    }
}
