using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.DeletePaymentPlan
{
    public record DeletePaymentPlanCommand(long Id) : IRequest<Result<bool>>;

    public class DeletePaymentPlanCommandValidator : AbstractValidator<DeletePaymentPlanCommand>
    {
        public DeletePaymentPlanCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
