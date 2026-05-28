using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class CreditNote : BaseEntity
    {
        public long StudentId { get; set; }
        public long? EnrollmentId { get; set; }
        public long? InvoiceId { get; set; }
        public string CreditNoteNo { get; set; } = default!;
        public decimal Amount { get; set; }
        public decimal AppliedAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public ECreditNoteStatus Status { get; set; } = ECreditNoteStatus.Open;
        public string Reason { get; set; } = default!;
        public DateTimeOffset IssuedAt { get; set; } = DateTimeOffset.UtcNow;
        public string? Notes { get; set; }
        public Student Student { get; set; } = default!;
        public Enrollment? Enrollment { get; set; }
        public Invoice? Invoice { get; set; }
        public ICollection<CreditNoteApplication> Applications { get; set; } = [];
    }
}
