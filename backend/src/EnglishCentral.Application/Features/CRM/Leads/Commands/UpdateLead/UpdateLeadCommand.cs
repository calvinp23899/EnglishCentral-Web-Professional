using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.UpdateLead
{
    public record UpdateLeadCommand(
        long Id,
        string FullName,
        string PhoneNumber,
        string? Email,
        long LeadSourceId,
        long? AssignedToUserId,
        long? InterestedCourseId,
        ELeadStatus Status,
        string? DemandNote,
        DateTimeOffset? NextFollowUpAt,
        ELeadLostReason? LostReason,
        string? LostReasonNote) : IRequest<Result<LeadResponse>>;

    public class UpdateLeadCommandValidator : AbstractValidator<UpdateLeadCommand>
    {
        public UpdateLeadCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(255);
            RuleFor(x => x.PhoneNumber).NotEmpty().MaximumLength(30);
            RuleFor(x => x.Email).EmailAddress().MaximumLength(255).When(x => !string.IsNullOrWhiteSpace(x.Email));
            RuleFor(x => x.LeadSourceId).GreaterThan(0);
            RuleFor(x => x.AssignedToUserId).GreaterThan(0).When(x => x.AssignedToUserId.HasValue);
            RuleFor(x => x.InterestedCourseId).GreaterThan(0).When(x => x.InterestedCourseId.HasValue);
            RuleFor(x => x.Status).IsInEnum();
            RuleFor(x => x.LostReason).IsInEnum().When(x => x.LostReason.HasValue);
            RuleFor(x => x.LostReason).NotNull().When(x => x.Status == ELeadStatus.Lost);
            RuleFor(x => x.DemandNote).MaximumLength(2000);
            RuleFor(x => x.LostReasonNote).MaximumLength(1000);
        }
    }
}
