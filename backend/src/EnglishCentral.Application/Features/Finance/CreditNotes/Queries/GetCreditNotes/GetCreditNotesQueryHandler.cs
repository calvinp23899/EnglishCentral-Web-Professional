using EnglishCentral.Application.Features.Finance.CreditNotes.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Queries.GetCreditNotes
{
    public class GetCreditNotesQueryHandler : IRequestHandler<GetCreditNotesQuery, Result<PagedResult<CreditNoteResponse>>>
    {
        private readonly IFinanceRepository<CreditNote> _repository;
        public GetCreditNotesQueryHandler(IFinanceRepository<CreditNote> repository) => _repository = repository;
        public async Task<Result<PagedResult<CreditNoteResponse>>> Handle(GetCreditNotesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.StudentId.HasValue) query = query.Where(x => x.StudentId == request.StudentId.Value);
            if (request.EnrollmentId.HasValue) query = query.Where(x => x.EnrollmentId == request.EnrollmentId.Value);
            if (request.Status.HasValue) query = query.Where(x => x.Status == request.Status.Value);
            query = request.IsDescending ? query.OrderByDescending(x => x.IssuedAt) : query.OrderBy(x => x.IssuedAt);
            var total = await _repository.CountAsync(_ => query, ct);
            var rows = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            return Result<PagedResult<CreditNoteResponse>>.Success(PagedResult<CreditNoteResponse>.Create(rows.Select(x => x.ToResponse()).ToList(), request.Page, request.PageSize, total));
        }
    }
}
