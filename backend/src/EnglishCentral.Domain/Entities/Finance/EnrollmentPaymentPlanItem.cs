using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class EnrollmentPaymentPlanItem : BaseEntity
    {
        public long PaymentPlanId { get; set; }

        public int SequenceNumber { get; set; }

        public string Name { get; set; } = default!;

        public DateOnly DueDate { get; set; }

        public decimal Amount { get; set; }

        public EPaymentPlanItemStatus Status { get; set; } = EPaymentPlanItemStatus.Pending;

        public EnrollmentPaymentPlan PaymentPlan { get; set; } = default!;

        public Invoice? Invoice { get; set; }
    }
}
