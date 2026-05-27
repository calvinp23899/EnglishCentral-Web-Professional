using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class Refund : BaseEntity
    {
        public long PaymentId { get; set; }
        public long? EnrollmentId { get; set; }
        public string RefundNo { get; set; } = default!;
        public decimal Amount { get; set; }
        public RefundStatus Status { get; set; } = RefundStatus.Pending;
        public RefundMethod Method { get; set; }
        public string Reason { get; set; } = default!;
        public DateTimeOffset RequestedAt { get; set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? RefundedAt { get; set; }
        public string? ReferenceCode { get; set; }
        public string? Notes { get; set; }
        public Payment Payment { get; set; } = default!;
        public Enrollment? Enrollment { get; set; }
    }
}
