using EnglishCentral.Application.Features.Finance.CreditNotes.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Commands.CreateCreditNote
{
    public class CreateCreditNoteCommandHandler : IRequestHandler<CreateCreditNoteCommand, Result<CreditNoteResponse>>
    {
        private readonly IFinanceRepository<CreditNote> _repository;
        private readonly IAcademicRepository<Student> _studentRepository;
        private readonly IFinanceRepository<BillingLedgerEntry> _ledgerRepository;
        public CreateCreditNoteCommandHandler(IFinanceRepository<CreditNote> repository, IAcademicRepository<Student> studentRepository, IFinanceRepository<BillingLedgerEntry> ledgerRepository)
        { _repository = repository; _studentRepository = studentRepository; _ledgerRepository = ledgerRepository; }
        public async Task<Result<CreditNoteResponse>> Handle(CreateCreditNoteCommand request, CancellationToken ct)
        {
            if (!await _studentRepository.ExistsAsync(x => x.Id == request.StudentId, ct)) return Result<CreditNoteResponse>.Failure("Student is not found.", 404);
            var note = new CreditNote { StudentId = request.StudentId, EnrollmentId = request.EnrollmentId, InvoiceId = request.InvoiceId, CreditNoteNo = $"CN-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}", Amount = request.Amount, AppliedAmount = 0, RemainingAmount = request.Amount, Status = CreditNoteStatus.Open, Reason = request.Reason.Trim(), IssuedAt = DateTimeOffset.UtcNow, Notes = request.Notes?.Trim(), CreatedAt = DateTimeOffset.UtcNow };
            await _repository.AddAsync(note, ct);
            await _ledgerRepository.AddAsync(new BillingLedgerEntry { EnrollmentId = request.EnrollmentId, InvoiceId = request.InvoiceId, CreditNote = note, Type = BillingLedgerEntryType.CreditNoteIssued, CreditAmount = request.Amount, BalanceAfter = 0, Description = request.Reason.Trim(), OccurredAt = DateTimeOffset.UtcNow }, ct);
            return Result<CreditNoteResponse>.Success(note.ToResponse(), 201);
        }
    }
}
