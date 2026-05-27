using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoiceById
{
    public record GetInvoiceByIdQuery(long Id) : IRequest<Result<InvoiceResponse>>;
}
