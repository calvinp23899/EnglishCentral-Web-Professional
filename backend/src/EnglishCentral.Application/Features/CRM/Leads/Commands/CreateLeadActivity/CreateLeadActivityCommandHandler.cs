using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.CreateLeadActivity
{
    public class CreateLeadActivityCommandHandler : IRequestHandler<CreateLeadActivityCommand, Result<LeadActivityResponse>>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly ILeadActivityRepository _activityRepository;
        private readonly IUserRepository _userRepository;

        public CreateLeadActivityCommandHandler(
            ILeadRepository leadRepository,
            ILeadActivityRepository activityRepository,
            IUserRepository userRepository)
        {
            _leadRepository = leadRepository;
            _activityRepository = activityRepository;
            _userRepository = userRepository;
        }

        public async Task<Result<LeadActivityResponse>> Handle(CreateLeadActivityCommand request, CancellationToken ct)
        {
            var lead = await _leadRepository.GetByIdAsync(request.LeadId, ct);
            if (lead is null)
                return Result<LeadActivityResponse>.Failure("Lead is not found.", 404);

            if (await _userRepository.GetByIdAsync(request.CreatedByUserId, ct, asNoTracking: true) is null)
                return Result<LeadActivityResponse>.Failure("Created by user is not found.", 404);

            var activity = new LeadActivity
            {
                LeadId = request.LeadId,
                ActivityType = request.ActivityType,
                Note = request.Note?.Trim(),
                Outcome = request.Outcome?.Trim(),
                NextFollowUpAt = request.NextFollowUpAt,
                CreatedByUserId = request.CreatedByUserId
            };

            lead.LastContactAt = DateTimeOffset.UtcNow;
            lead.NextFollowUpAt = request.NextFollowUpAt;

            await _activityRepository.AddAsync(activity, ct);

            return Result<LeadActivityResponse>.Success(activity.ToResponse(), 201);
        }
    }
}
