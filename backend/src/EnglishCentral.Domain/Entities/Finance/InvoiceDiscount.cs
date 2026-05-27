using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class InvoiceDiscount : BaseEntity
    {
        public long InvoiceId { get; set; }
        public long? EnrollmentDiscountId { get; set; }
        public long? DiscountId { get; set; }
        public string Name { get; set; } = default!;
        public DiscountType Type { get; set; }
        public decimal Value { get; set; }
        public decimal Amount { get; set; }
        public string? Reason { get; set; }
        public Invoice Invoice { get; set; } = default!;
        public EnrollmentDiscount? EnrollmentDiscount { get; set; }
        public Discount? Discount { get; set; }
    }
}
