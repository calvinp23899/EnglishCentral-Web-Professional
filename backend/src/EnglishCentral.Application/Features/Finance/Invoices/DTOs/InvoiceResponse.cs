using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Application.Features.Finance.Invoices.DTOs
{
    public record InvoiceLineResponse(
        long Id,
        EBillingItemType ItemType,
        string Description,
        int Quantity,
        decimal UnitPrice,
        decimal DiscountAmount,
        decimal LineTotal);

    public record InvoiceResponse(
        Guid PublicId,
        long Id,
        long EnrollmentId,
        long? PaymentPlanItemId,
        string InvoiceNo,
        DateTimeOffset IssuedAt,
        DateOnly DueDate,
        decimal SubtotalAmount,
        decimal DiscountAmount,
        decimal TaxAmount,
        decimal TotalAmount,
        decimal PaidAmount,
        decimal OutstandingAmount,
        EInvoiceStatus Status,
        string? Notes,
        IReadOnlyCollection<InvoiceLineResponse> Lines);

    public static class InvoiceMapping
    {
        public static InvoiceResponse ToResponse(this Invoice invoice)
        {
            return new InvoiceResponse(
                invoice.PublicId,
                invoice.Id,
                invoice.EnrollmentId,
                invoice.PaymentPlanItemId,
                invoice.InvoiceNo,
                invoice.IssuedAt,
                invoice.DueDate,
                invoice.SubtotalAmount,
                invoice.DiscountAmount,
                invoice.TaxAmount,
                invoice.TotalAmount,
                invoice.PaidAmount,
                invoice.OutstandingAmount,
                invoice.Status,
                invoice.Notes,
                invoice.Lines
                    .Select(x => new InvoiceLineResponse(
                        x.Id,
                        x.ItemType,
                        x.Description,
                        x.Quantity,
                        x.UnitPrice,
                        x.DiscountAmount,
                        x.LineTotal))
                    .ToList());
        }
    }
}
