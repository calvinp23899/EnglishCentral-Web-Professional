using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Enrollment : BaseEntity
    {
        public long StudentId { get; set; }

        public long ClassId { get; set; }

        public string EnrollmentCode { get; set; } = default!;

        public DateTimeOffset EnrolledAt { get; set; } = DateTimeOffset.UtcNow;

        public DateOnly? StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        public EEnrollmentStatus Status { get; set; } = EEnrollmentStatus.Active;

        public decimal TuitionFee { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal FinalAmount { get; set; }

        public decimal PaidAmount { get; set; }

        public decimal OutstandingAmount { get; set; }

        public string? CancellationReason { get; set; }

        public DateTimeOffset? CancelledAt { get; set; }

        public long? CancelledBy { get; set; }

        public string? Notes { get; set; }

        // Navigation

        public Student Student { get; set; } = default!;

        public Class Class { get; set; } = default!;

        public EnrollmentPaymentPlan? PaymentPlan { get; set; }

        public ICollection<Invoice> Invoices { get; set; } = [];

        public ICollection<EnrollmentDiscount> Discounts { get; set; } = [];
    }
}
