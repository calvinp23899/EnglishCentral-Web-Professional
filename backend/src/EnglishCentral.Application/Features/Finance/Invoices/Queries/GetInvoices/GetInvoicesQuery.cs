using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoices
{
    public record GetInvoicesQuery(
        long? EnrollmentId = null,
        long? StudentId = null,
        EInvoiceStatus? Status = null,
        int Page = 1,
        int PageSize = 20,
        bool IsDescending = true) : IRequest<Result<PagedResult<InvoiceResponse>>>;

    public class GetInvoicesQueryValidator : AbstractValidator<GetInvoicesQuery>
    {
        public GetInvoicesQueryValidator()
        {
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.StudentId).GreaterThan(0).When(x => x.StudentId.HasValue);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
