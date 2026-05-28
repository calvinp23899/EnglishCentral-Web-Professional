using EnglishCentral.Application.Features.Finance.Ledger.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Ledger.Queries.GetBillingLedgerEntries
{
    public record GetBillingLedgerEntriesQuery(long? EnrollmentId = null, long? InvoiceId = null, long? PaymentId = null, EBillingLedgerEntryType? Type = null, int Page = 1, int PageSize = 20, bool IsDescending = true) : IRequest<Result<PagedResult<BillingLedgerEntryResponse>>>;
    public class GetBillingLedgerEntriesQueryValidator : AbstractValidator<GetBillingLedgerEntriesQuery>
    {
        public GetBillingLedgerEntriesQueryValidator()
        {
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.InvoiceId).GreaterThan(0).When(x => x.InvoiceId.HasValue);
            RuleFor(x => x.PaymentId).GreaterThan(0).When(x => x.PaymentId.HasValue);
            RuleFor(x => x.Type).IsInEnum().When(x => x.Type.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
