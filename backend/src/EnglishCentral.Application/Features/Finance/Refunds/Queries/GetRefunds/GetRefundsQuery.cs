using EnglishCentral.Application.Features.Finance.Refunds.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Refunds.Queries.GetRefunds
{
    public record GetRefundsQuery(long? PaymentId = null, long? EnrollmentId = null, RefundStatus? Status = null, int Page = 1, int PageSize = 20, bool IsDescending = true) : IRequest<Result<PagedResult<RefundResponse>>>;
    public class GetRefundsQueryValidator : AbstractValidator<GetRefundsQuery>
    {
        public GetRefundsQueryValidator()
        {
            RuleFor(x => x.PaymentId).GreaterThan(0).When(x => x.PaymentId.HasValue);
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
