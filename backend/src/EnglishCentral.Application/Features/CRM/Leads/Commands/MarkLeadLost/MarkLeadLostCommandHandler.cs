using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.MarkLeadLost
{
    public class MarkLeadLostCommandHandler : IRequestHandler<MarkLeadLostCommand, Result<LeadResponse>>
    {
        private readonly ILeadRepository _repository;

        public MarkLeadLostCommandHandler(ILeadRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<LeadResponse>> Handle(MarkLeadLostCommand request, CancellationToken ct)
        {
            var lead = await _repository.GetByIdAsync(request.LeadId, ct);
            if (lead is null)
                return Result<LeadResponse>.Failure("Lead is not found.", 404);

            if (lead.Status == ELeadStatus.Converted)
                return Result<LeadResponse>.Failure("Converted lead cannot be marked as lost.", 409);

            lead.Status = ELeadStatus.Lost;
            lead.LostReason = request.LostReason;
            lead.LostReasonNote = request.LostReasonNote?.Trim();
            lead.NextFollowUpAt = null;

            return Result<LeadResponse>.Success(lead.ToResponse());
        }
    }
}
