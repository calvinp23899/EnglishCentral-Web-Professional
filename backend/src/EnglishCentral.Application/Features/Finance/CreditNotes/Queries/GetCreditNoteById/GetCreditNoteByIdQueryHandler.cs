using EnglishCentral.Application.Features.Finance.CreditNotes.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Queries.GetCreditNoteById
{
    public class GetCreditNoteByIdQueryHandler : IRequestHandler<GetCreditNoteByIdQuery, Result<CreditNoteResponse>>
    {
        private readonly IFinanceRepository<CreditNote> _repository;
        public GetCreditNoteByIdQueryHandler(IFinanceRepository<CreditNote> repository) => _repository = repository;
        public async Task<Result<CreditNoteResponse>> Handle(GetCreditNoteByIdQuery request, CancellationToken ct)
        {
            var note = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return note is null ? Result<CreditNoteResponse>.Failure("Credit note is not found.", 404) : Result<CreditNoteResponse>.Success(note.ToResponse());
        }
    }
}
