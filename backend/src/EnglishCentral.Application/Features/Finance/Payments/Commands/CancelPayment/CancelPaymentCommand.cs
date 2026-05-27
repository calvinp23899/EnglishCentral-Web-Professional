using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Payments.Commands.CancelPayment
{
    public record CancelPaymentCommand(long Id, string? Reason) : IRequest<Result<bool>>;
    public class CancelPaymentCommandValidator : AbstractValidator<CancelPaymentCommand>
    {
        public CancelPaymentCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Reason).MaximumLength(1000);
        }
    }
}
