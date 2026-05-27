using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class PaymentAllocation : BaseEntity
    {
        public long PaymentId { get; set; }

        public long InvoiceId { get; set; }

        public decimal Amount { get; set; }

        public DateTimeOffset AllocatedAt { get; set; } = DateTimeOffset.UtcNow;

        public Payment Payment { get; set; } = default!;

        public Invoice Invoice { get; set; } = default!;
    }
}
