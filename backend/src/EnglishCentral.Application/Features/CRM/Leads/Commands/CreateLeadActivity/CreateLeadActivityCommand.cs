using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.CreateLeadActivity
{
    public record CreateLeadActivityCommand(
        long LeadId,
        ELeadActivityType ActivityType,
        string? Note,
        string? Outcome,
        DateTimeOffset? NextFollowUpAt,
        long CreatedByUserId) : IRequest<Result<LeadActivityResponse>>;

    public class CreateLeadActivityCommandValidator : AbstractValidator<CreateLeadActivityCommand>
    {
        public CreateLeadActivityCommandValidator()
        {
            RuleFor(x => x.LeadId).GreaterThan(0);
            RuleFor(x => x.ActivityType).IsInEnum();
            RuleFor(x => x.Note).MaximumLength(2000);
            RuleFor(x => x.Outcome).MaximumLength(1000);
            RuleFor(x => x.CreatedByUserId).GreaterThan(0);
        }
    }
}
