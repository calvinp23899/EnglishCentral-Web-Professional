using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Domain.Enums.CRM;

namespace EnglishCentral.Domain.Entities.CRM
{
    public class Lead : BaseEntity
    {
        public string LeadCode { get; set; } = default!;

        public string FullName { get; set; } = default!;

        public string PhoneNumber { get; set; } = default!;

        public string? Email { get; set; }

        public long LeadSourceId { get; set; }

        public long? AssignedToUserId { get; set; }

        public long? InterestedCourseId { get; set; }

        public ELeadStatus Status { get; set; } = ELeadStatus.New;

        public string? DemandNote { get; set; }

        public string? UtmSource { get; set; }

        public string? UtmMedium { get; set; }

        public string? UtmCampaign { get; set; }

        public string? ReferrerUrl { get; set; }

        public string? LandingPageUrl { get; set; }

        public DateTimeOffset? LastContactAt { get; set; }

        public DateTimeOffset? NextFollowUpAt { get; set; }

        public ELeadLostReason? LostReason { get; set; }

        public string? LostReasonNote { get; set; }

        public DateTimeOffset? ConvertedAt { get; set; }

        public LeadSource LeadSource { get; set; } = default!;

        public User? AssignedToUser { get; set; }

        public Course? InterestedCourse { get; set; }

        public ICollection<LeadActivity> Activities { get; set; } = [];

        public LeadConversion? Conversion { get; set; }
    }
}
