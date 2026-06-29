using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.CreateInvoiceFromPaymentPlanItem
{
    public record CreateInvoiceFromPaymentPlanItemCommand(
        long PaymentPlanItemId,
        string? Notes) : IRequest<Result<InvoiceResponse>>;

    public class CreateInvoiceFromPaymentPlanItemCommandValidator : AbstractValidator<CreateInvoiceFromPaymentPlanItemCommand>
    {
        public CreateInvoiceFromPaymentPlanItemCommandValidator()
        {
            RuleFor(x => x.PaymentPlanItemId).GreaterThan(0);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
