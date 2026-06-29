using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Queries.GetBillingPolicyById
{
    public record GetBillingPolicyByIdQuery(long Id) : IRequest<Result<BillingPolicyResponse>>;

    public class GetBillingPolicyByIdQueryValidator : AbstractValidator<GetBillingPolicyByIdQuery>
    {
        public GetBillingPolicyByIdQueryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
