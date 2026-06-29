using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlanById
{
    public record GetPaymentPlanByIdQuery(long Id) : IRequest<Result<PaymentPlanResponse>>;

    public class GetPaymentPlanByIdQueryValidator : AbstractValidator<GetPaymentPlanByIdQuery>
    {
        public GetPaymentPlanByIdQueryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
