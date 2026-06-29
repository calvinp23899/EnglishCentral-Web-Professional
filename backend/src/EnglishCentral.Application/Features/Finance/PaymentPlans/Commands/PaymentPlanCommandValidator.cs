using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands
{
    public static class PaymentPlanCommandValidator
    {
        public static Result<bool> Validate(
            EPaymentPlanType type,
            decimal totalAmount,
            int? numberOfInstallments,
            IReadOnlyCollection<PaymentPlanItemRequest> items)
        {
            if (items.Select(x => x.SequenceNumber).Distinct().Count() != items.Count)
                return Result<bool>.Failure("Payment plan item sequence numbers must be unique.", 400);

            if (items.Sum(x => x.Amount) != totalAmount)
                return Result<bool>.Failure("Payment plan item total must equal payment plan total amount.", 400);

            if (type == EPaymentPlanType.FullPayment && items.Count != 1)
                return Result<bool>.Failure("Full payment plan must have exactly one item.", 400);

            if (type == EPaymentPlanType.Installment && numberOfInstallments != items.Count)
                return Result<bool>.Failure("Installment count must match payment plan item count.", 400);

            return Result<bool>.Success(true);
        }
    }
}
