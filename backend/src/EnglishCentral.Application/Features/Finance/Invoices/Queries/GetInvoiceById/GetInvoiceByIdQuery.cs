using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoiceById
{
    public record GetInvoiceByIdQuery(long Id) : IRequest<Result<InvoiceResponse>>;

    public class GetInvoiceByIdQueryValidator : AbstractValidator<GetInvoiceByIdQuery>
    {
        public GetInvoiceByIdQueryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
