using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.ConvertLead
{
    public class ConvertLeadCommandHandler : IRequestHandler<ConvertLeadCommand, Result<LeadConversionResponse>>
    {
        private readonly ILeadRepository _leadRepository;
        private readonly ILeadConversionRepository _conversionRepository;
        private readonly IAcademicRepository<Student> _studentRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IUserRepository _userRepository;

        public ConvertLeadCommandHandler(
            ILeadRepository leadRepository,
            ILeadConversionRepository conversionRepository,
            IAcademicRepository<Student> studentRepository,
            IAcademicRepository<Enrollment> enrollmentRepository,
            IUserRepository userRepository)
        {
            _leadRepository = leadRepository;
            _conversionRepository = conversionRepository;
            _studentRepository = studentRepository;
            _enrollmentRepository = enrollmentRepository;
            _userRepository = userRepository;
        }

        public async Task<Result<LeadConversionResponse>> Handle(ConvertLeadCommand request, CancellationToken ct)
        {
            var lead = await _leadRepository.GetByIdWithDetailsAsync(request.LeadId, ct, asNoTracking: false);
            if (lead is null)
                return Result<LeadConversionResponse>.Failure("Lead is not found.", 404);

            if (lead.Status == ELeadStatus.Converted || await _conversionRepository.ExistsAsync(x => x.LeadId == request.LeadId, ct))
                return Result<LeadConversionResponse>.Failure("Lead has already been converted.", 409);

            var student = await _studentRepository.FirstOrDefaultAsync(x => x.Id == request.StudentId, ct);
            if (student is null)
                return Result<LeadConversionResponse>.Failure("Student is not found.", 404);

            Enrollment? enrollment = null;
            if (request.EnrollmentId.HasValue)
            {
                enrollment = await _enrollmentRepository.FirstOrDefaultAsync(x => x.Id == request.EnrollmentId.Value, ct);
                if (enrollment is null)
                    return Result<LeadConversionResponse>.Failure("Enrollment is not found.", 404);

                if (enrollment.StudentId != request.StudentId)
                    return Result<LeadConversionResponse>.Failure("Enrollment does not belong to selected student.", 400);
            }

            if (await _userRepository.GetByIdAsync(request.ConvertedByUserId, ct, asNoTracking: true) is null)
                return Result<LeadConversionResponse>.Failure("Converted by user is not found.", 404);

            var convertedAt = DateTimeOffset.UtcNow;
            var conversion = new LeadConversion
            {
                LeadId = lead.Id,
                StudentId = request.StudentId,
                EnrollmentId = request.EnrollmentId,
                ConvertedByUserId = request.ConvertedByUserId,
                ConvertedAt = convertedAt,
                SourceIdSnapshot = lead.LeadSourceId,
                SourceNameSnapshot = lead.LeadSource?.Name,
                ChannelSnapshot = lead.LeadSource?.Channel.ToString(),
                CourseIdSnapshot = lead.InterestedCourseId,
                CourseNameSnapshot = lead.InterestedCourse?.Name,
                RevenueSnapshot = request.RevenueSnapshot ?? enrollment?.FinalAmount,
                Note = request.Note?.Trim()
            };

            lead.Status = ELeadStatus.Converted;
            lead.ConvertedAt = convertedAt;
            lead.NextFollowUpAt = null;

            await _conversionRepository.AddAsync(conversion, ct);

            return Result<LeadConversionResponse>.Success(conversion.ToResponse(), 201);
        }
    }
}
