using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class Receipt : BaseEntity
    {
        public long PaymentId { get; set; }

        public string ReceiptNo { get; set; } = default!;

        public DateTimeOffset IssuedAt { get; set; } = DateTimeOffset.UtcNow;

        public decimal Amount { get; set; }

        public string? Notes { get; set; }

        public Payment Payment { get; set; } = default!;
    }
}
