using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.CRM;

namespace EnglishCentral.Domain.Entities.CRM
{
    public class LeadSource : BaseEntity
    {
        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public ELeadSourceChannel Channel { get; set; } = ELeadSourceChannel.Other;

        public string? CampaignName { get; set; }

        public string? Description { get; set; }

        public decimal? Cost { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<Lead> Leads { get; set; } = [];
    }
}
