using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs
{
    public record PaymentPlanItemResponse(
        Guid PublicId,
        long Id,
        int SequenceNumber,
        string Name,
        DateOnly DueDate,
        decimal Amount,
        EPaymentPlanItemStatus Status,
        long? InvoiceId);

    public record PaymentPlanResponse(
        Guid PublicId,
        long Id,
        long EnrollmentId,
        long? BillingPolicyId,
        EPaymentPlanType Type,
        decimal TotalAmount,
        int? NumberOfInstallments,
        EPaymentPlanStatus Status,
        string? Notes,
        IReadOnlyCollection<PaymentPlanItemResponse> Items);

    public static class PaymentPlanMapping
    {
        public static PaymentPlanResponse ToResponse(this EnrollmentPaymentPlan plan)
        {
            return new PaymentPlanResponse(
                plan.PublicId,
                plan.Id,
                plan.EnrollmentId,
                plan.BillingPolicyId,
                plan.Type,
                plan.TotalAmount,
                plan.NumberOfInstallments,
                plan.Status,
                plan.Notes,
                plan.Items
                    .OrderBy(x => x.SequenceNumber)
                    .Select(x => new PaymentPlanItemResponse(
                        x.PublicId,
                        x.Id,
                        x.SequenceNumber,
                        x.Name,
                        x.DueDate,
                        x.Amount,
                        x.Status,
                        x.Invoice?.Id))
                    .ToList());
        }
    }
}
