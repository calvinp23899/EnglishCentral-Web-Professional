using EnglishCentral.Application.Features.Finance.Payments.DTOs;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.SettleRemainingPaymentPlan
{
    public record SettleRemainingPaymentPlanCommand(
        long Id,
        long? FromPaymentPlanItemId,
        DateTimeOffset? PaidAt,
        EPaymentMethod Method,
        string? ReferenceCode,
        string? PayerName,
        string? PayerPhone,
        string? Notes) : IRequest<Result<PaymentResponse>>;

    public class SettleRemainingPaymentPlanCommandValidator : AbstractValidator<SettleRemainingPaymentPlanCommand>
    {
        public SettleRemainingPaymentPlanCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.FromPaymentPlanItemId).GreaterThan(0).When(x => x.FromPaymentPlanItemId.HasValue);
            RuleFor(x => x.Method).IsInEnum();
            RuleFor(x => x.ReferenceCode).MaximumLength(100);
            RuleFor(x => x.PayerName).MaximumLength(255);
            RuleFor(x => x.PayerPhone).MaximumLength(30);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
