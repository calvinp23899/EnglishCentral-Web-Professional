using EnglishCentral.Application.Features.Finance.CreditNotes.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Queries.GetCreditNoteById
{
    public record GetCreditNoteByIdQuery(long Id) : IRequest<Result<CreditNoteResponse>>;
    public class GetCreditNoteByIdQueryValidator : AbstractValidator<GetCreditNoteByIdQuery>
    {
        public GetCreditNoteByIdQueryValidator() => RuleFor(x => x.Id).GreaterThan(0);
    }
}
