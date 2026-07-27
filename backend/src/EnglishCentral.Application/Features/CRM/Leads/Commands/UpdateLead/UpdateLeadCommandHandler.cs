using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.UpdateLead
{
    public class UpdateLeadCommandHandler : IRequestHandler<UpdateLeadCommand, Result<LeadResponse>>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly ILeadSourceRepository _leadSourceRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAcademicRepository<Course> _courseRepository;

        public UpdateLeadCommandHandler(
            ILeadRepository leadRepository,
            ILeadSourceRepository leadSourceRepository,
            IUserRepository userRepository,
            IAcademicRepository<Course> courseRepository)
        {
            _leadRepository = leadRepository;
            _leadSourceRepository = leadSourceRepository;
            _userRepository = userRepository;
            _courseRepository = courseRepository;
        }

        public async Task<Result<LeadResponse>> Handle(UpdateLeadCommand request, CancellationToken ct)
        {
            var lead = await _leadRepository.GetByIdAsync(request.Id, ct);
            if (lead is null)
                return Result<LeadResponse>.Failure("Lead is not found.", 404);

            var source = await _leadSourceRepository.GetByIdAsync(request.LeadSourceId, ct, asNoTracking: true);
            if (source is null || !source.IsActive)
                return Result<LeadResponse>.Failure("Lead source is not found or inactive.", 404);

            if (request.AssignedToUserId.HasValue
                && await _userRepository.GetByIdAsync(request.AssignedToUserId.Value, ct, asNoTracking: true) is null)
                return Result<LeadResponse>.Failure("Assigned user is not found.", 404);

            if (request.InterestedCourseId.HasValue
                && await _courseRepository.FirstOrDefaultAsync(x => x.Id == request.InterestedCourseId.Value, ct) is null)
                return Result<LeadResponse>.Failure("Interested course is not found.", 404);

            lead.FullName = request.FullName.Trim();
            lead.PhoneNumber = request.PhoneNumber.Trim();
            lead.Email = request.Email?.Trim();
            lead.LeadSourceId = request.LeadSourceId;
            lead.AssignedToUserId = request.AssignedToUserId;
            lead.InterestedCourseId = request.InterestedCourseId;
            lead.Status = request.Status;
            lead.DemandNote = request.DemandNote?.Trim();
            lead.NextFollowUpAt = request.NextFollowUpAt;
            lead.LostReason = request.Status == ELeadStatus.Lost ? request.LostReason : null;
            lead.LostReasonNote = request.Status == ELeadStatus.Lost ? request.LostReasonNote?.Trim() : null;

            return Result<LeadResponse>.Success(lead.ToResponse());
        }
    }
}
