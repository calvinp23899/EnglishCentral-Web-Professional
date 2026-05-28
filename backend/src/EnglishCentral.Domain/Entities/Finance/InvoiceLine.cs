using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Finance
{
    public class InvoiceLine : BaseEntity
    {
        public long InvoiceId { get; set; }

        public EBillingItemType ItemType { get; set; }

        public string Description { get; set; } = default!;

        public int Quantity { get; set; } = 1;

        public decimal UnitPrice { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal LineTotal { get; set; }

        public Invoice Invoice { get; set; } = default!;
    }
}
