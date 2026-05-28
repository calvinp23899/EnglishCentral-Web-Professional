using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class EnrollmentDiscount : BaseEntity
    {
        public long EnrollmentId { get; set; }
        public long? DiscountId { get; set; }
        public string Name { get; set; } = default!;
        public EDiscountType Type { get; set; }
        public decimal Value { get; set; }
        public decimal Amount { get; set; }
        public string? Reason { get; set; }
        public Enrollment Enrollment { get; set; } = default!;
        public Discount? Discount { get; set; }
    }
}
