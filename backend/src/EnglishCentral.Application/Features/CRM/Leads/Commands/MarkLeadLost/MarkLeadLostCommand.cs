using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.MarkLeadLost
{
    public record MarkLeadLostCommand(
        long LeadId,
        ELeadLostReason LostReason,
        string? LostReasonNote) : IRequest<Result<LeadResponse>>;

    public class MarkLeadLostCommandValidator : AbstractValidator<MarkLeadLostCommand>
    {
        public MarkLeadLostCommandValidator()
        {
            RuleFor(x => x.LeadId).GreaterThan(0);
            RuleFor(x => x.LostReason).IsInEnum();
            RuleFor(x => x.LostReasonNote).MaximumLength(1000);
        }
    }
}
