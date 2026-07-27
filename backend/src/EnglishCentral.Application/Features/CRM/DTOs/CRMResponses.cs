using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Domain.Enums.CRM;

namespace EnglishCentral.Application.Features.CRM.DTOs
{
    public record LeadSourceResponse(
        Guid PublicId,
        long Id,
        string Code,
        string Name,
        ELeadSourceChannel Channel,
        string? CampaignName,
        string? Description,
        decimal? Cost,
        bool IsActive,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt);

    public record LeadResponse(
        Guid PublicId,
        long Id,
        string LeadCode,
        string FullName,
        string PhoneNumber,
        string? Email,
        long LeadSourceId,
        string LeadSourceName,
        ELeadSourceChannel LeadSourceChannel,
        long? AssignedToUserId,
        string? AssignedToUserName,
        long? InterestedCourseId,
        string? InterestedCourseName,
        ELeadStatus Status,
        string? DemandNote,
        string? UtmSource,
        string? UtmMedium,
        string? UtmCampaign,
        string? ReferrerUrl,
        string? LandingPageUrl,
        DateTimeOffset? LastContactAt,
        DateTimeOffset? NextFollowUpAt,
        ELeadLostReason? LostReason,
        string? LostReasonNote,
        DateTimeOffset? ConvertedAt,
        DateTimeOffset CreatedAt,
        DateTimeOffset? UpdatedAt,
        List<LeadActivityResponse> Activities,
        LeadConversionResponse? Conversion);

    public record LeadActivityResponse(
        Guid PublicId,
        long Id,
        long LeadId,
        ELeadActivityType ActivityType,
        string? Note,
        string? Outcome,
        DateTimeOffset? NextFollowUpAt,
        long CreatedByUserId,
        string? CreatedByUserName,
        DateTimeOffset CreatedAt);

    public record LeadConversionResponse(
        Guid PublicId,
        long Id,
        long LeadId,
        long StudentId,
        string? StudentCode,
        string? StudentName,
        long? EnrollmentId,
        string? EnrollmentCode,
        long ConvertedByUserId,
        string? ConvertedByUserName,
        DateTimeOffset ConvertedAt,
        long? SourceIdSnapshot,
        string? SourceNameSnapshot,
        string? ChannelSnapshot,
        long? CourseIdSnapshot,
        string? CourseNameSnapshot,
        decimal? RevenueSnapshot,
        string? Note,
        DateTimeOffset CreatedAt);

    public static class CRMMappings
    {
        public static LeadSourceResponse ToResponse(this LeadSource entity) => new(
            entity.PublicId,
            entity.Id,
            entity.Code,
            entity.Name,
            entity.Channel,
            entity.CampaignName,
            entity.Description,
            entity.Cost,
            entity.IsActive,
            entity.CreatedAt,
            entity.UpdatedAt);

        public static LeadResponse ToResponse(this Lead entity) => new(
            entity.PublicId,
            entity.Id,
            entity.LeadCode,
            entity.FullName,
            entity.PhoneNumber,
            entity.Email,
            entity.LeadSourceId,
            entity.LeadSource?.Name ?? string.Empty,
            entity.LeadSource?.Channel ?? ELeadSourceChannel.Other,
            entity.AssignedToUserId,
            entity.AssignedToUser?.FullName,
            entity.InterestedCourseId,
            entity.InterestedCourse?.Name,
            entity.Status,
            entity.DemandNote,
            entity.UtmSource,
            entity.UtmMedium,
            entity.UtmCampaign,
            entity.ReferrerUrl,
            entity.LandingPageUrl,
            entity.LastContactAt,
            entity.NextFollowUpAt,
            entity.LostReason,
            entity.LostReasonNote,
            entity.ConvertedAt,
            entity.CreatedAt,
            entity.UpdatedAt,
            entity.Activities.OrderByDescending(x => x.CreatedAt).Select(x => x.ToResponse()).ToList(),
            entity.Conversion?.ToResponse());

        public static LeadActivityResponse ToResponse(this LeadActivity entity) => new(
            entity.PublicId,
            entity.Id,
            entity.LeadId,
            entity.ActivityType,
            entity.Note,
            entity.Outcome,
            entity.NextFollowUpAt,
            entity.CreatedByUserId,
            entity.CreatedByUser?.FullName,
            entity.CreatedAt);

        public static LeadConversionResponse ToResponse(this LeadConversion entity) => new(
            entity.PublicId,
            entity.Id,
            entity.LeadId,
            entity.StudentId,
            entity.Student?.StudentCode,
            entity.Student?.FullName,
            entity.EnrollmentId,
            entity.Enrollment?.EnrollmentCode,
            entity.ConvertedByUserId,
            entity.ConvertedByUser?.FullName,
            entity.ConvertedAt,
            entity.SourceIdSnapshot,
            entity.SourceNameSnapshot,
            entity.ChannelSnapshot,
            entity.CourseIdSnapshot,
            entity.CourseNameSnapshot,
            entity.RevenueSnapshot,
            entity.Note,
            entity.CreatedAt);
    }
}
