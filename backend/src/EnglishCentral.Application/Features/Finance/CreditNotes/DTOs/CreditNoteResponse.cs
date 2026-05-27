using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Finance.CreditNotes.DTOs
{
    public record CreditNoteResponse(Guid PublicId, long Id, long StudentId, long? EnrollmentId, long? InvoiceId, string CreditNoteNo, decimal Amount, decimal AppliedAmount, decimal RemainingAmount, CreditNoteStatus Status, string Reason, DateTimeOffset IssuedAt, string? Notes);
    public static class CreditNoteMapping
    {
        public static CreditNoteResponse ToResponse(this CreditNote note) => new(note.PublicId, note.Id, note.StudentId, note.EnrollmentId, note.InvoiceId, note.CreditNoteNo, note.Amount, note.AppliedAmount, note.RemainingAmount, note.Status, note.Reason, note.IssuedAt, note.Notes);
    }
}
