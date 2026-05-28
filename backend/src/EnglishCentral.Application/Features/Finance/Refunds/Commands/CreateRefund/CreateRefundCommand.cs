using EnglishCentral.Application.Features.Finance.Refunds.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Refunds.Commands.CreateRefund
{
    public record CreateRefundCommand(long PaymentId, long? EnrollmentId, decimal Amount, ERefundMethod Method, string Reason, string? ReferenceCode, string? Notes) : IRequest<Result<RefundResponse>>;
    public class CreateRefundCommandValidator : AbstractValidator<CreateRefundCommand>
    {
        public CreateRefundCommandValidator()
        {
            RuleFor(x => x.PaymentId).GreaterThan(0);
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.Amount).GreaterThan(0);
            RuleFor(x => x.Method).IsInEnum();
            RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
            RuleFor(x => x.ReferenceCode).MaximumLength(100);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
