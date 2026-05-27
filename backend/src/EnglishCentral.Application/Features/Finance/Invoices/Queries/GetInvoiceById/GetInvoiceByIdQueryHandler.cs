using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoiceById
{
    public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceResponse>>
    {
        private readonly IAcademicRepository<Invoice> _repository;
        private readonly IAcademicRepository<InvoiceLine> _invoiceLineRepository;

        public GetInvoiceByIdQueryHandler(
            IAcademicRepository<Invoice> repository,
            IAcademicRepository<InvoiceLine> invoiceLineRepository)
        {
            _repository = repository;
            _invoiceLineRepository = invoiceLineRepository;
        }

        public async Task<Result<InvoiceResponse>> Handle(GetInvoiceByIdQuery request, CancellationToken ct)
        {
            var invoice = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            if (invoice is not null)
            {
                var lines = await _invoiceLineRepository.ListAsync(q => q.Where(x => x.InvoiceId == invoice.Id), ct);
                invoice.Lines = lines;
            }

            return invoice is null
                ? Result<InvoiceResponse>.Failure("Invoice is not found.", 404)
                : Result<InvoiceResponse>.Success(invoice.ToResponse());
        }
    }
}
