using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Domain.Enums.CRM;

namespace EnglishCentral.Domain.Entities.CRM
{
    public class LeadActivity : BaseEntity
    {
        public long LeadId { get; set; }

        public ELeadActivityType ActivityType { get; set; }

        public string? Note { get; set; }

        public string? Outcome { get; set; }

        public DateTimeOffset? NextFollowUpAt { get; set; }

        public long CreatedByUserId { get; set; }

        public Lead Lead { get; set; } = default!;

        public User CreatedByUser { get; set; } = default!;
    }
}
