using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Application.Features.Finance.Payments.DTOs
{
    public record PaymentAllocationResponse(
        long InvoiceId,
        decimal Amount);

    public record PaymentResponse(
        Guid PublicId,
        long Id,
        long StudentId,
        string PaymentNo,
        DateTimeOffset PaidAt,
        decimal Amount,
        EPaymentMethod Method,
        EPaymentStatus Status,
        string? ReferenceCode,
        string? PayerName,
        string? PayerPhone,
        string? Notes,
        string? ReceiptNo,
        IReadOnlyCollection<PaymentAllocationResponse> Allocations);

    public static class PaymentMapping
    {
        public static PaymentResponse ToResponse(this Payment payment)
        {
            return new PaymentResponse(
                payment.PublicId,
                payment.Id,
                payment.StudentId,
                payment.PaymentNo,
                payment.PaidAt,
                payment.Amount,
                payment.Method,
                payment.Status,
                payment.ReferenceCode,
                payment.PayerName,
                payment.PayerPhone,
                payment.Notes,
                payment.Receipt?.ReceiptNo,
                payment.Allocations
                    .Select(x => new PaymentAllocationResponse(x.InvoiceId, x.Amount))
                    .ToList());
        }
    }
}
