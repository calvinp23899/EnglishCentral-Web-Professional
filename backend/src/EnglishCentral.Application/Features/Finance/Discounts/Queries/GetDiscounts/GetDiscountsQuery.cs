using EnglishCentral.Application.Features.Finance.Discounts.DTOs;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Queries.GetDiscounts
{
    public record GetDiscountsQuery(EDiscountType? Type = null, bool? IsActive = null, int Page = 1, int PageSize = 20, bool IsDescending = true) : IRequest<Result<PagedResult<DiscountResponse>>>;

    public class GetDiscountsQueryValidator : AbstractValidator<GetDiscountsQuery>
    {
        public GetDiscountsQueryValidator()
        {
            RuleFor(x => x.Type).IsInEnum().When(x => x.Type.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
