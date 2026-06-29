using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Application.Features.Finance.Ledger.DTOs
{
    public record BillingLedgerEntryResponse(Guid PublicId, long Id, long? EnrollmentId, long? InvoiceId, long? PaymentId, long? PaymentAllocationId, long? RefundId, long? CreditNoteId, EBillingLedgerEntryType Type, decimal DebitAmount, decimal CreditAmount, decimal BalanceAfter, DateTimeOffset OccurredAt, string? Description);
    public static class BillingLedgerEntryMapping
    {
        public static BillingLedgerEntryResponse ToResponse(this BillingLedgerEntry entry) => new(entry.PublicId, entry.Id, entry.EnrollmentId, entry.InvoiceId, entry.PaymentId, entry.PaymentAllocationId, entry.RefundId, entry.CreditNoteId, entry.Type, entry.DebitAmount, entry.CreditAmount, entry.BalanceAfter, entry.OccurredAt, entry.Description);
    }
}
