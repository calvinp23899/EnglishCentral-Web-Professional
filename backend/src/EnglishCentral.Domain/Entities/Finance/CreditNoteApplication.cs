using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class CreditNoteApplication : BaseEntity
    {
        public long CreditNoteId { get; set; }
        public long InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public DateTimeOffset AppliedAt { get; set; } = DateTimeOffset.UtcNow;
        public CreditNote CreditNote { get; set; } = default!;
        public Invoice Invoice { get; set; } = default!;
    }
}
