using EnglishCentral.Application.Features.Finance.Payments.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Payments.Commands.CreatePayment
{
    public record CreatePaymentCommand(
        long StudentId,
        string? PaymentNo,
        DateTimeOffset? PaidAt,
        decimal Amount,
        PaymentMethod Method,
        string? ReferenceCode,
        string? PayerName,
        string? PayerPhone,
        string? Notes,
        IReadOnlyCollection<CreatePaymentAllocationRequest> Allocations) : IRequest<Result<PaymentResponse>>;

    public record CreatePaymentAllocationRequest(
        long InvoiceId,
        decimal Amount);

    public class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
    {
        public CreatePaymentCommandValidator()
        {
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.PaymentNo).MaximumLength(50);
            RuleFor(x => x.Amount).GreaterThan(0);
            RuleFor(x => x.Method).IsInEnum();
            RuleFor(x => x.ReferenceCode).MaximumLength(100);
            RuleFor(x => x.PayerName).MaximumLength(255);
            RuleFor(x => x.PayerPhone).MaximumLength(30);
            RuleFor(x => x.Notes).MaximumLength(2000);
            RuleFor(x => x.Allocations).NotEmpty();
            RuleForEach(x => x.Allocations).ChildRules(allocation =>
            {
                allocation.RuleFor(x => x.InvoiceId).GreaterThan(0);
                allocation.RuleFor(x => x.Amount).GreaterThan(0);
            });
        }
    }
}
