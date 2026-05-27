using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Queries.GetBillingPolicies
{
    public record GetBillingPoliciesQuery(
        BillingPolicyType? Type = null,
        bool? IsActive = null,
        int Page = 1,
        int PageSize = 20,
        bool IsDescending = true) : IRequest<Result<PagedResult<BillingPolicyResponse>>>;

    public class GetBillingPoliciesQueryValidator : AbstractValidator<GetBillingPoliciesQuery>
    {
        public GetBillingPoliciesQueryValidator()
        {
            RuleFor(x => x.Type).IsInEnum().When(x => x.Type.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
