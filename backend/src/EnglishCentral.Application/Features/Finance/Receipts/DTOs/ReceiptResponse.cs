using EnglishCentral.Domain.Entities.Finance;

namespace EnglishCentral.Application.Features.Finance.Receipts.DTOs
{
    public record ReceiptResponse(
        Guid PublicId,
        long Id,
        long PaymentId,
        string ReceiptNo,
        DateTimeOffset IssuedAt,
        decimal Amount,
        string? Notes);

    public static class ReceiptMapping
    {
        public static ReceiptResponse ToResponse(this Receipt receipt)
        {
            return new ReceiptResponse(
                receipt.PublicId,
                receipt.Id,
                receipt.PaymentId,
                receipt.ReceiptNo,
                receipt.IssuedAt,
                receipt.Amount,
                receipt.Notes);
        }
    }
}
