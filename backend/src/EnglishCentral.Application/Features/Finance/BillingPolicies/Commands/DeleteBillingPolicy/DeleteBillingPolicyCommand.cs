using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.DeleteBillingPolicy
{
    public record DeleteBillingPolicyCommand(long Id) : IRequest<Result<bool>>;

    public class DeleteBillingPolicyCommandValidator : AbstractValidator<DeleteBillingPolicyCommand>
    {
        public DeleteBillingPolicyCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
