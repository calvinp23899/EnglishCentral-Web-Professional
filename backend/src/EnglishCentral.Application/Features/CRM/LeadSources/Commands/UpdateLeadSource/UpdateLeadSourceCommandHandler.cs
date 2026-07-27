using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Commands.UpdateLeadSource
{
    public class UpdateLeadSourceCommandHandler : IRequestHandler<UpdateLeadSourceCommand, Result<LeadSourceResponse>>
    {
        private readonly ILeadSourceRepository _repository;

        public UpdateLeadSourceCommandHandler(ILeadSourceRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<LeadSourceResponse>> Handle(UpdateLeadSourceCommand request, CancellationToken ct)
        {
            var source = await _repository.GetByIdAsync(request.Id, ct);
            if (source is null)
                return Result<LeadSourceResponse>.Failure("Lead source is not found.", 404);

            var code = request.Code.Trim().ToUpper();
            if (await _repository.ExistsByCodeAsync(code, request.Id, ct))
                return Result<LeadSourceResponse>.Failure("Lead source code already exists.", 409);

            source.Code = code;
            source.Name = request.Name.Trim();
            source.Channel = request.Channel;
            source.CampaignName = request.CampaignName?.Trim();
            source.Description = request.Description?.Trim();
            source.Cost = request.Cost;
            source.IsActive = request.IsActive;

            return Result<LeadSourceResponse>.Success(source.ToResponse());
        }
    }
}
