using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.Commands.ApplyCreditNote
{
    public class ApplyCreditNoteCommandHandler : IRequestHandler<ApplyCreditNoteCommand, Result<bool>>
    {
        private readonly IFinanceRepository<CreditNote> _creditNoteRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly IFinanceRepository<CreditNoteApplication> _applicationRepository;
        private readonly IFinanceRepository<BillingLedgerEntry> _ledgerRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        public ApplyCreditNoteCommandHandler(IFinanceRepository<CreditNote> creditNoteRepository, IFinanceRepository<Invoice> invoiceRepository, IFinanceRepository<CreditNoteApplication> applicationRepository, IFinanceRepository<BillingLedgerEntry> ledgerRepository, IAcademicRepository<Enrollment> enrollmentRepository)
        { _creditNoteRepository = creditNoteRepository; _invoiceRepository = invoiceRepository; _applicationRepository = applicationRepository; _ledgerRepository = ledgerRepository; _enrollmentRepository = enrollmentRepository; }
        public async Task<Result<bool>> Handle(ApplyCreditNoteCommand request, CancellationToken ct)
        {
            var note = await _creditNoteRepository.GetByIdAsync(request.CreditNoteId, ct);
            if (note is null)
                return Result<bool>.Failure("Credit note is not found.", 404);
            var invoice = await _invoiceRepository.GetByIdAsync(request.InvoiceId, ct);
            if (invoice is null)
                return Result<bool>.Failure("Invoice is not found.", 404);
            if (note.Status == ECreditNoteStatus.Cancelled || invoice.Status == EInvoiceStatus.Cancelled)
                return Result<bool>.Failure("Cancelled credit note or invoice cannot be applied.", 400);
            var enrollment = await _enrollmentRepository.GetByIdAsync(invoice.EnrollmentId, ct);
            if (enrollment is null)
                return Result<bool>.Failure("Invoice enrollment is not found.", 404);
            if (enrollment.StudentId != note.StudentId)
                return Result<bool>.Failure("Credit note student does not match invoice student.", 400);
            if (note.EnrollmentId.HasValue && note.EnrollmentId.Value != invoice.EnrollmentId)
                return Result<bool>.Failure("Credit note enrollment does not match invoice enrollment.", 400);
            if (request.Amount > note.RemainingAmount || request.Amount > invoice.OutstandingAmount) return Result<bool>.Failure("Apply amount is invalid.", 400);
            note.AppliedAmount += request.Amount; note.RemainingAmount -= request.Amount; note.Status = note.RemainingAmount == 0 ? ECreditNoteStatus.Applied : ECreditNoteStatus.PartiallyApplied; note.UpdatedAt = DateTimeOffset.UtcNow;
            invoice.OutstandingAmount -= request.Amount; invoice.Status = invoice.OutstandingAmount == 0 ? EInvoiceStatus.Paid : EInvoiceStatus.PartiallyPaid; invoice.UpdatedAt = DateTimeOffset.UtcNow;
            enrollment.OutstandingAmount -= request.Amount; enrollment.UpdatedAt = DateTimeOffset.UtcNow;
            var app = new CreditNoteApplication { CreditNoteId = note.Id, InvoiceId = invoice.Id, Amount = request.Amount, AppliedAt = DateTimeOffset.UtcNow, CreatedAt = DateTimeOffset.UtcNow };
            await _applicationRepository.AddAsync(app, ct);
            await _ledgerRepository.AddAsync(new BillingLedgerEntry { EnrollmentId = invoice.EnrollmentId, InvoiceId = invoice.Id, CreditNoteId = note.Id, Type = EBillingLedgerEntryType.CreditNoteApplied, CreditAmount = request.Amount, BalanceAfter = invoice.OutstandingAmount, Description = "Credit note applied", OccurredAt = DateTimeOffset.UtcNow }, ct);
            return Result<bool>.Success(true);
        }
    }
}
