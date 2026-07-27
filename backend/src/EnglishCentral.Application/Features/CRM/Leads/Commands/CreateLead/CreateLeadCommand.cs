using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.CreateLead
{
    public record CreateLeadCommand(
        string FullName,
        string PhoneNumber,
        string? Email,
        long LeadSourceId,
        long? AssignedToUserId,
        long? InterestedCourseId,
        string? DemandNote,
        string? UtmSource,
        string? UtmMedium,
        string? UtmCampaign,
        string? ReferrerUrl,
        string? LandingPageUrl,
        DateTimeOffset? NextFollowUpAt) : IRequest<Result<LeadResponse>>;

    public class CreateLeadCommandValidator : AbstractValidator<CreateLeadCommand>
    {
        public CreateLeadCommandValidator()
        {
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(255);
            RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(30);
            RuleFor(x => x.Email).EmailAddress().MaximumLength(255).When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.LeadSourceId).GreaterThan(0);
            RuleFor(x => x.AssignedToUserId).GreaterThan(0).When(x => x.AssignedToUserId.HasValue);
            RuleFor(x => x.InterestedCourseId).GreaterThan(0).When(x => x.InterestedCourseId.HasValue);
            RuleFor(x => x.DemandNote).MaximumLength(2000);
            RuleFor(x => x.UtmSource).MaximumLength(100);
            RuleFor(x => x.UtmMedium).MaximumLength(100);
            RuleFor(x => x.UtmCampaign).MaximumLength(255);
            RuleFor(x => x.ReferrerUrl).MaximumLength(1000);
            RuleFor(x => x.LandingPageUrl).MaximumLength(1000);
        }
    }
}
