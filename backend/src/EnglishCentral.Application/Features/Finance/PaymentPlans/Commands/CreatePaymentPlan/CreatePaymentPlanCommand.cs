using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.CreatePaymentPlan
{
    public record CreatePaymentPlanCommand(
        long EnrollmentId,
        long? BillingPolicyId,
        EPaymentPlanType Type,
        decimal TotalAmount,
        int? NumberOfInstallments,
        EPaymentPlanStatus Status,
        string? Notes,
        IReadOnlyCollection<PaymentPlanItemRequest> Items) : IRequest<Result<PaymentPlanResponse>>;

    public class CreatePaymentPlanCommandValidator : AbstractValidator<CreatePaymentPlanCommand>
    {
        public CreatePaymentPlanCommandValidator()
        {
            this.AddPaymentPlanRules(
                x => x.EnrollmentId,
                x => x.BillingPolicyId,
                x => x.Type,
                x => x.TotalAmount,
                x => x.NumberOfInstallments,
                x => x.Status,
                x => x.Notes,
                x => x.Items);
        }
    }
}
