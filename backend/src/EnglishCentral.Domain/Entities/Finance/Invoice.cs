using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class Invoice : BaseEntity
    {
        public long EnrollmentId { get; set; }

        public long? PaymentPlanItemId { get; set; }

        public string InvoiceNo { get; set; } = default!;

        public DateTimeOffset IssuedAt { get; set; } = DateTimeOffset.UtcNow;

        public DateOnly DueDate { get; set; }

        public decimal SubtotalAmount { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal PaidAmount { get; set; }

        public decimal OutstandingAmount { get; set; }

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Issued;

        public string? Notes { get; set; }

        public Enrollment Enrollment { get; set; } = default!;

        public EnrollmentPaymentPlanItem? PaymentPlanItem { get; set; }

        public ICollection<InvoiceLine> Lines { get; set; } = [];

        public ICollection<PaymentAllocation> PaymentAllocations { get; set; } = [];
    }
}
