using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class Payment : BaseEntity
    {
        public long StudentId { get; set; }

        public string PaymentNo { get; set; } = default!;

        public DateTimeOffset PaidAt { get; set; } = DateTimeOffset.UtcNow;

        public decimal Amount { get; set; }

        public PaymentMethod Method { get; set; }

        public PaymentStatus Status { get; set; } = PaymentStatus.Completed;

        public string? ReferenceCode { get; set; }

        public string? PayerName { get; set; }

        public string? PayerPhone { get; set; }

        public string? Notes { get; set; }

        public Student Student { get; set; } = default!;

        public ICollection<PaymentAllocation> Allocations { get; set; } = [];

        public ICollection<Refund> Refunds { get; set; } = [];

        public Receipt? Receipt { get; set; }
    }
}
