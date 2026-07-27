using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.CreateLead
{
    public class CreateLeadCommandHandler : IRequestHandler<CreateLeadCommand, Result<LeadResponse>>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly ILeadSourceRepository _leadSourceRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAcademicRepository<Course> _courseRepository;
        private readonly ICodeGenerator _codeGenerator;

        public CreateLeadCommandHandler(
            ILeadRepository leadRepository,
            ILeadSourceRepository leadSourceRepository,
            IUserRepository userRepository,
            IAcademicRepository<Course> courseRepository,
            ICodeGenerator codeGenerator)
        {
            _leadRepository = leadRepository;
            _leadSourceRepository = leadSourceRepository;
            _userRepository = userRepository;
            _courseRepository = courseRepository;
            _codeGenerator = codeGenerator;
        }

        public async Task<Result<LeadResponse>> Handle(CreateLeadCommand request, CancellationToken ct)
        {
            var source = await _leadSourceRepository.GetByIdAsync(request.LeadSourceId, ct, asNoTracking: true);
            if (source is null || !source.IsActive)
                return Result<LeadResponse>.Failure("Lead source is not found or inactive.", 404);

            if (request.AssignedToUserId.HasValue
                && await _userRepository.GetByIdAsync(request.AssignedToUserId.Value, ct, asNoTracking: true) is null)
                return Result<LeadResponse>.Failure("Assigned user is not found.", 404);

            if (request.InterestedCourseId.HasValue
                && await _courseRepository.FirstOrDefaultAsync(x => x.Id == request.InterestedCourseId.Value, ct) is null)
                return Result<LeadResponse>.Failure("Interested course is not found.", 404);

            var leadCode = $"LEAD-{_codeGenerator.GenerateCode()}";
            if (await _leadRepository.ExistsByLeadCodeAsync(leadCode, ct))
                return Result<LeadResponse>.Failure("Lead code already exists.", 409);

            var lead = new Lead
            {
                LeadCode = leadCode,
                FullName = request.FullName.Trim(),
                PhoneNumber = request.PhoneNumber.Trim(),
                Email = request.Email?.Trim(),
                LeadSourceId = request.LeadSourceId,
                AssignedToUserId = request.AssignedToUserId,
                InterestedCourseId = request.InterestedCourseId,
                Status = ELeadStatus.New,
                DemandNote = request.DemandNote?.Trim(),
                UtmSource = request.UtmSource?.Trim(),
                UtmMedium = request.UtmMedium?.Trim(),
                UtmCampaign = request.UtmCampaign?.Trim(),
                ReferrerUrl = request.ReferrerUrl?.Trim(),
                LandingPageUrl = request.LandingPageUrl?.Trim(),
                NextFollowUpAt = request.NextFollowUpAt
            };

            await _leadRepository.AddAsync(lead, ct);

            return Result<LeadResponse>.Success(lead.ToResponse(), 201);
        }
    }
}
