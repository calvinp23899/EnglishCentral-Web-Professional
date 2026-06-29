using EnglishCentral.Application.Features.Finance.Refunds.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Refunds.Queries.GetRefundById
{
    public record GetRefundByIdQuery(long Id) : IRequest<Result<RefundResponse>>;
    public class GetRefundByIdQueryValidator : AbstractValidator<GetRefundByIdQuery>
    {
        public GetRefundByIdQueryValidator() => RuleFor(x => x.Id).GreaterThan(0);
    }
}
