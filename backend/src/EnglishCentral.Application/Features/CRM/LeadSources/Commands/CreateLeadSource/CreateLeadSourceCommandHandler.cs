using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Shared.Results;
using EnglishCentral.Shared.Utilities;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Commands.CreateLeadSource
{
    public class CreateLeadSourceCommandHandler : IRequestHandler<CreateLeadSourceCommand, Result<LeadSourceResponse>>
    {
        private readonly ILeadSourceRepository _repository;

        public CreateLeadSourceCommandHandler(ILeadSourceRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<LeadSourceResponse>> Handle(CreateLeadSourceCommand request, CancellationToken ct)
        {
            var code = request.Name.ConvertNameToCode();
            if (await _repository.ExistsByCodeAsync(code, ct: ct))
                return Result<LeadSourceResponse>.Failure("Lead source code already exists.", 409);

            var source = new LeadSource
            {
                Code = code,
                Name = request.Name.Trim(),
                Channel = request.Channel,
                CampaignName = request.CampaignName?.Trim(),
                Description = request.Description?.Trim(),
                Cost = request.Cost,
                IsActive = request.IsActive
            };

            await _repository.AddAsync(source, ct);

            return Result<LeadSourceResponse>.Success(source.ToResponse(), 201);
        }

    }
}
