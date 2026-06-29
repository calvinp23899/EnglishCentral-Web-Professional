using EnglishCentral.Application.Features.Finance.Ledger.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Ledger.Queries.GetBillingLedgerEntries
{
    public class GetBillingLedgerEntriesQueryHandler : IRequestHandler<GetBillingLedgerEntriesQuery, Result<PagedResult<BillingLedgerEntryResponse>>>
    {
        private readonly IFinanceRepository<BillingLedgerEntry> _repository;
        public GetBillingLedgerEntriesQueryHandler(IFinanceRepository<BillingLedgerEntry> repository) => _repository = repository;
        public async Task<Result<PagedResult<BillingLedgerEntryResponse>>> Handle(GetBillingLedgerEntriesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.EnrollmentId.HasValue) query = query.Where(x => x.EnrollmentId == request.EnrollmentId.Value);
            if (request.InvoiceId.HasValue) query = query.Where(x => x.InvoiceId == request.InvoiceId.Value);
            if (request.PaymentId.HasValue) query = query.Where(x => x.PaymentId == request.PaymentId.Value);
            if (request.Type.HasValue) query = query.Where(x => x.Type == request.Type.Value);
            query = request.IsDescending ? query.OrderByDescending(x => x.OccurredAt) : query.OrderBy(x => x.OccurredAt);
            var total = await _repository.CountAsync(_ => query, ct);
            var rows = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            return Result<PagedResult<BillingLedgerEntryResponse>>.Success(PagedResult<BillingLedgerEntryResponse>.Create(rows.Select(x => x.ToResponse()).ToList(), request.Page, request.PageSize, total));
        }
    }
}
