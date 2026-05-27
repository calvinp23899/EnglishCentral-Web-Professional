using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.UpdateEnrollment
{
    public class UpdateEnrollmentCommandHandler : IRequestHandler<UpdateEnrollmentCommand, Result<EnrollmentResponse>>
    {
        private readonly IAcademicRepository<Enrollment> _repository;

        public UpdateEnrollmentCommandHandler(IAcademicRepository<Enrollment> repository)
        {
            _repository = repository;
        }

        public async Task<Result<EnrollmentResponse>> Handle(UpdateEnrollmentCommand request, CancellationToken ct)
        {
            var enrollment = await _repository.GetByIdAsync(request.Id, ct);
            if (enrollment is null)
                return Result<EnrollmentResponse>.Failure("Enrollment is not found.", 404);

            if (!string.IsNullOrWhiteSpace(request.EnrollmentCode))
            {
                var code = request.EnrollmentCode.Trim();
                if (await _repository.ExistsAsync(x => x.Id != request.Id && x.EnrollmentCode == code, ct))
                    return Result<EnrollmentResponse>.Failure("Enrollment code already exists.", 409);
                enrollment.EnrollmentCode = code;
            }

            enrollment.StartDate = request.StartDate;
            enrollment.EndDate = request.EndDate;
            enrollment.Status = request.Status;
            enrollment.TuitionFee = request.TuitionFee;
            enrollment.DiscountAmount = request.DiscountAmount;
            enrollment.FinalAmount = request.FinalAmount;
            enrollment.PaidAmount = request.PaidAmount;
            enrollment.OutstandingAmount = request.OutstandingAmount;
            enrollment.CancellationReason = request.CancellationReason?.Trim();
            enrollment.CancelledAt = request.CancelledAt;
            enrollment.CancelledBy = request.CancelledBy;
            enrollment.Notes = request.Notes?.Trim();
            enrollment.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<EnrollmentResponse>.Success(enrollment.ToResponse());
        }
    }
}
