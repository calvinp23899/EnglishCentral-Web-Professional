using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.UpdatePaymentPlan
{
    public record UpdatePaymentPlanCommand(
        long Id,
        long EnrollmentId,
        long? BillingPolicyId,
        EPaymentPlanType Type,
        decimal TotalAmount,
        int? NumberOfInstallments,
        EPaymentPlanStatus Status,
        string? Notes,
        IReadOnlyCollection<PaymentPlanItemRequest> Items) : IRequest<Result<PaymentPlanResponse>>;

    public class UpdatePaymentPlanCommandValidator : AbstractValidator<UpdatePaymentPlanCommand>
    {
        public UpdatePaymentPlanCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
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
