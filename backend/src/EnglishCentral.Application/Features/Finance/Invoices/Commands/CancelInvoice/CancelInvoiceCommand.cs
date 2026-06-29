using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.CancelInvoice
{
    public record CancelInvoiceCommand(long Id, string? Reason) : IRequest<Result<bool>>;

    public class CancelInvoiceCommandValidator : AbstractValidator<CancelInvoiceCommand>
    {
        public CancelInvoiceCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Reason).MaximumLength(1000);
        }
    }
}
