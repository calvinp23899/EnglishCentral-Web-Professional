using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Commands.ApplyCreditNote
{
    public record ApplyCreditNoteCommand(long CreditNoteId, long InvoiceId, decimal Amount) : IRequest<Result<bool>>;
    public class ApplyCreditNoteCommandValidator : AbstractValidator<ApplyCreditNoteCommand>
    {
        public ApplyCreditNoteCommandValidator()
        {
            RuleFor(x => x.CreditNoteId).GreaterThan(0);
            RuleFor(x => x.InvoiceId).GreaterThan(0);
            RuleFor(x => x.Amount).GreaterThan(0);
        }
    }
}
