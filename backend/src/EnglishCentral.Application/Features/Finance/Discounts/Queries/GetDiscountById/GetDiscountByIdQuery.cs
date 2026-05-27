using EnglishCentral.Application.Features.Finance.Discounts.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Queries.GetDiscountById
{
    public record GetDiscountByIdQuery(long Id) : IRequest<Result<DiscountResponse>>;
    public class GetDiscountByIdQueryValidator : AbstractValidator<GetDiscountByIdQuery>
    {
        public GetDiscountByIdQueryValidator() => RuleFor(x => x.Id).GreaterThan(0);
    }
}
