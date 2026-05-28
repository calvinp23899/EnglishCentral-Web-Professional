using EnglishCentral.Application.Features.Finance.CreditNotes.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Queries.GetCreditNotes
{
    public record GetCreditNotesQuery(long? StudentId = null, long? EnrollmentId = null, ECreditNoteStatus? Status = null, int Page = 1, int PageSize = 20, bool IsDescending = true) : IRequest<Result<PagedResult<CreditNoteResponse>>>;
    public class GetCreditNotesQueryValidator : AbstractValidator<GetCreditNotesQuery>
    {
        public GetCreditNotesQueryValidator()
        {
            RuleFor(x => x.StudentId).GreaterThan(0).When(x => x.StudentId.HasValue);
            RuleFor(x => x.EnrollmentId).GreaterThan(0).When(x => x.EnrollmentId.HasValue);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
        }
    }
}
