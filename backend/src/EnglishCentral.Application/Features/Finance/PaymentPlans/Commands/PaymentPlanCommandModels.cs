using EnglishCentral.Domain.Enums.Finance;
using FluentValidation;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands
{
    public record PaymentPlanItemRequest(
        int SequenceNumber,
        string Name,
        DateOnly DueDate,
        decimal Amount,
        EPaymentPlanItemStatus Status);

    public static class PaymentPlanCommandRules
    {
        public static void AddPaymentPlanRules<T>(
            this AbstractValidator<T> validator,
            Func<T, long> enrollmentId,
            Func<T, long?> billingPolicyId,
            Func<T, EPaymentPlanType> type,
            Func<T, decimal> totalAmount,
            Func<T, int?> numberOfInstallments,
            Func<T, EPaymentPlanStatus> status,
            Func<T, string?> notes,
            Func<T, IReadOnlyCollection<PaymentPlanItemRequest>> items)
        {
            validator.RuleFor(x => enrollmentId(x)).GreaterThan(0);
            validator.RuleFor(x => billingPolicyId(x)).GreaterThan(0).When(x => billingPolicyId(x).HasValue);
            validator.RuleFor(x => type(x)).IsInEnum();
            validator.RuleFor(x => totalAmount(x)).GreaterThan(0);
            validator.RuleFor(x => numberOfInstallments(x)).GreaterThan(1).When(x => type(x) == EPaymentPlanType.Installment);
            validator.RuleFor(x => status(x)).IsInEnum();
            validator.RuleFor(x => notes(x)).MaximumLength(2000);
            validator.RuleFor(x => items(x)).NotEmpty();
            validator.RuleForEach(x => items(x)).ChildRules(item =>
            {
                item.RuleFor(x => x.SequenceNumber).GreaterThan(0);
                item.RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
                item.RuleFor(x => x.Amount).GreaterThan(0);
                item.RuleFor(x => x.Status).IsInEnum();
            });
        }
    }
}
