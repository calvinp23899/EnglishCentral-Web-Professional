using EnglishCentral.Application.Features.Finance.Receipts.DTOs;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Receipts.Queries.GetReceipts
{
    public record GetReceiptsQuery(
        long? PaymentId = null,
        int Page = 1,
        int PageSize = 20,
        bool IsDescending = true) : IRequest<Result<PagedResult<ReceiptResponse>>>;

    public class GetReceiptsQueryValidator : AbstractValidator<GetReceiptsQuery>
    {
        public GetReceiptsQueryValidator()
        {
            RuleFor(x => x.PaymentId).GreaterThan(0).When(x => x.PaymentId.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
