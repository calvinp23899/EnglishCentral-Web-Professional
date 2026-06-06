using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.UpdateInvoice
{
    public record UpdateInvoiceCommand(
        long Id,
        DateOnly? DueDate,
        string? Notes) : IRequest<Result<InvoiceResponse>>;

    public class UpdateInvoiceCommandValidator : AbstractValidator<UpdateInvoiceCommand>
    {
        public UpdateInvoiceCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
