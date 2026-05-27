using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoices
{
    public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, Result<PagedResult<InvoiceResponse>>>
    {
        private readonly IFinanceRepository<Invoice> _repository;
        private readonly IFinanceRepository<InvoiceLine> _invoiceLineRepository;

        public GetInvoicesQueryHandler(
            IFinanceRepository<Invoice> repository,
            IFinanceRepository<InvoiceLine> invoiceLineRepository)
        {
            _repository = repository;
            _invoiceLineRepository = invoiceLineRepository;
        }

        public async Task<Result<PagedResult<InvoiceResponse>>> Handle(GetInvoicesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();

            if (request.EnrollmentId.HasValue)
                query = query.Where(x => x.EnrollmentId == request.EnrollmentId.Value);
            if (request.StudentId.HasValue)
                query = query.Where(x => x.Enrollment.StudentId == request.StudentId.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            query = request.IsDescending
                ? query.OrderByDescending(x => x.IssuedAt)
                : query.OrderBy(x => x.IssuedAt);

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var invoices = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var invoiceIds = invoices.Select(x => x.Id).ToList();
            var lines = await _invoiceLineRepository.ListAsync(q => q.Where(x => invoiceIds.Contains(x.InvoiceId)), ct);
            foreach (var invoice in invoices)
                invoice.Lines = lines.Where(x => x.InvoiceId == invoice.Id).ToList();

            var items = invoices.Select(x => x.ToResponse()).ToList();

            return Result<PagedResult<InvoiceResponse>>.Success(PagedResult<InvoiceResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
