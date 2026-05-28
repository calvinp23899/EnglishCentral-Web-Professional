using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class BillingLedgerEntry : BaseEntity
    {
        public long? EnrollmentId { get; set; }
        public long? InvoiceId { get; set; }
        public long? PaymentId { get; set; }
        public long? PaymentAllocationId { get; set; }
        public long? RefundId { get; set; }
        public long? CreditNoteId { get; set; }
        public EBillingLedgerEntryType Type { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal BalanceAfter { get; set; }
        public DateTimeOffset OccurredAt { get; set; } = DateTimeOffset.UtcNow;
        public string? Description { get; set; }
        public Enrollment? Enrollment { get; set; }
        public Invoice? Invoice { get; set; }
        public Payment? Payment { get; set; }
        public PaymentAllocation? PaymentAllocation { get; set; }
        public Refund? Refund { get; set; }
        public CreditNote? CreditNote { get; set; }
    }
}
