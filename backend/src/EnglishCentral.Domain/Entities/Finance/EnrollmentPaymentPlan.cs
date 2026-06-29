using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class EnrollmentPaymentPlan : BaseEntity
    {
        public long EnrollmentId { get; set; }

        public long? BillingPolicyId { get; set; }

        public EPaymentPlanType Type { get; set; }

        public decimal TotalAmount { get; set; }

        public int? NumberOfInstallments { get; set; }

        public EPaymentPlanStatus Status { get; set; } = EPaymentPlanStatus.Active;

        public string? Notes { get; set; }

        public Enrollment Enrollment { get; set; } = default!;

        public BillingPolicy? BillingPolicy { get; set; }

        public ICollection<EnrollmentPaymentPlanItem> Items { get; set; } = [];
    }
}
