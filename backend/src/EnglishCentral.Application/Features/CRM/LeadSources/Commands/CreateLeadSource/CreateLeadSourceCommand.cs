using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Commands.CreateLeadSource
{
    public record CreateLeadSourceCommand(
        string Code,
        string Name,
        ELeadSourceChannel Channel,
        string? CampaignName,
        string? Description,
        decimal? Cost,
        bool IsActive = true) : IRequest<Result<LeadSourceResponse>>;

    public class CreateLeadSourceCommandValidator : AbstractValidator<CreateLeadSourceCommand>
    {
        public CreateLeadSourceCommandValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Channel).IsInEnum();
            RuleFor(x => x.CampaignName).MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(2000);
            RuleFor(x => x.Cost).GreaterThanOrEqualTo(0).When(x => x.Cost.HasValue);
        }
    }
}
