using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Enrollment : BaseEntity
    {
        public long StudentId { get; set; }

        public long ClassId { get; set; }

        public DateTimeOffset EnrolledAt { get; set; } = DateTimeOffset.UtcNow;

        public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;

        public decimal TuitionFee { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal FinalAmount { get; set; }

        public string? Notes { get; set; }

        // Navigation

        public Student Student { get; set; } = default!;

        public Class Class { get; set; } = default!;
    }
}
