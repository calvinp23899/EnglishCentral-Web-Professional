using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoices
{
    public record GetInvoicesQuery(
        long? EnrollmentId = null,
        long? StudentId = null,
        InvoiceStatus? Status = null,
        int Page = 1,
        int PageSize = 20,
        bool IsDescending = true) : IRequest<Result<PagedResult<InvoiceResponse>>>;
}
