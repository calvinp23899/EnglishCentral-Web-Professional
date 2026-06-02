using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlans
{
    public record GetPaymentPlansQuery(
        long? EnrollmentId = null,
        EPaymentPlanType? Type = null,
        EPaymentPlanStatus? Status = null,
        int Page = 1,
        int PageSize = 20,
        bool IsDescending = true) : IRequest<Result<PagedResult<PaymentPlanResponse>>>;

    public class GetPaymentPlansQueryValidator : AbstractValidator<GetPaymentPlansQuery>
    {
        public GetPaymentPlansQueryValidator()
        {
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.Type).IsInEnum().When(x => x.Type.HasValue);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
