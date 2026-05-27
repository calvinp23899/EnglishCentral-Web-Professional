using EnglishCentral.Application.Features.Finance.CreditNotes.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Commands.CreateCreditNote
{
    public record CreateCreditNoteCommand(long StudentId, long? EnrollmentId, long? InvoiceId, decimal Amount, string Reason, string? Notes) : IRequest<Result<CreditNoteResponse>>;
    public class CreateCreditNoteCommandValidator : AbstractValidator<CreateCreditNoteCommand>
    {
        public CreateCreditNoteCommandValidator()
        {
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.InvoiceId).GreaterThan(0).When(x => x.InvoiceId.HasValue);
            RuleFor(x => x.Amount).GreaterThan(0);
            RuleFor(x => x.Reason).NotEmpty().MaximumLength(1000);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
