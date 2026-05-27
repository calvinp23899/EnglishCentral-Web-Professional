using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Finance.Refunds.DTOs
{
    public record RefundResponse(Guid PublicId, long Id, long PaymentId, long? EnrollmentId, string RefundNo, decimal Amount, RefundStatus Status, RefundMethod Method, string Reason, DateTimeOffset RequestedAt, DateTimeOffset? RefundedAt, string? ReferenceCode, string? Notes);
    public static class RefundMapping
    {
        public static RefundResponse ToResponse(this Refund refund) => new(refund.PublicId, refund.Id, refund.PaymentId, refund.EnrollmentId, refund.RefundNo, refund.Amount, refund.Status, refund.Method, refund.Reason, refund.RequestedAt, refund.RefundedAt, refund.ReferenceCode, refund.Notes);
    }
}
