using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class Discount : BaseEntity
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public EDiscountType Type { get; set; }
        public decimal Value { get; set; }
        public DateOnly? ValidFrom { get; set; }
        public DateOnly? ValidTo { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Description { get; set; }
        public ICollection<EnrollmentDiscount> EnrollmentDiscounts { get; set; } = [];
        public ICollection<InvoiceDiscount> InvoiceDiscounts { get; set; } = [];
    }
}
