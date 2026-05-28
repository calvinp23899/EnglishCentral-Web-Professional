using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class BillingPolicy : BaseEntity
    {
        public string Name { get; set; } = default!;

        public EBillingPolicyType Type { get; set; }

        public int? NumberOfInstallments { get; set; }

        public bool IsDefault { get; set; }

        public bool IsActive { get; set; } = true;

        public string? Notes { get; set; }

        public ICollection<Course> Courses { get; set; } = [];

        public ICollection<Class> Classes { get; set; } = [];

        public ICollection<EnrollmentPaymentPlan> PaymentPlans { get; set; } = [];
    }
}
