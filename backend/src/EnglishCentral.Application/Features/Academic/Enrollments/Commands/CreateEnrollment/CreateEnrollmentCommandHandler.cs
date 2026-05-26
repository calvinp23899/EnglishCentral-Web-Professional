using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.CreateEnrollment
{
    public class CreateEnrollmentCommandHandler : IRequestHandler<CreateEnrollmentCommand, Result<EnrollmentResponse>>
    {
        private readonly IAcademicRepository<Enrollment> _repository;
        private readonly IAcademicRepository<Student> _studentRepository;
        private readonly IAcademicRepository<AcademicClass> _classRepository;

        public CreateEnrollmentCommandHandler(IAcademicRepository<Enrollment> repository, IAcademicRepository<Student> studentRepository, IAcademicRepository<AcademicClass> classRepository)
        {
            _repository = repository;
            _studentRepository = studentRepository;
            _classRepository = classRepository;
        }

        public async Task<Result<EnrollmentResponse>> Handle(CreateEnrollmentCommand request, CancellationToken ct)
        {
            if (!await _studentRepository.ExistsAsync(x => x.Id == request.StudentId, ct))
                return Result<EnrollmentResponse>.Failure("Student is not found.", 404);
            if (!await _classRepository.ExistsAsync(x => x.Id == request.ClassId, ct))
                return Result<EnrollmentResponse>.Failure("Class is not found.", 404);
            if (await _repository.ExistsAsync(x => x.StudentId == request.StudentId && x.ClassId == request.ClassId, ct))
                return Result<EnrollmentResponse>.Failure("Student is already enrolled in this class.", 409);

            var enrollmentCode = string.IsNullOrWhiteSpace(request.EnrollmentCode)
                ? $"ENR-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}"
                : request.EnrollmentCode.Trim();

            if (await _repository.ExistsAsync(x => x.EnrollmentCode == enrollmentCode, ct))
                return Result<EnrollmentResponse>.Failure("Enrollment code already exists.", 409);

            var enrollment = new Enrollment
            {
                StudentId = request.StudentId,
                ClassId = request.ClassId,
                EnrollmentCode = enrollmentCode,
                EnrolledAt = request.EnrolledAt ?? DateTimeOffset.UtcNow,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status,
                TuitionFee = request.TuitionFee,
                DiscountAmount = request.DiscountAmount,
                FinalAmount = request.FinalAmount,
                PaidAmount = request.PaidAmount,
                OutstandingAmount = request.OutstandingAmount,
                CancellationReason = request.CancellationReason?.Trim(),
                CancelledAt = request.CancelledAt,
                CancelledBy = request.CancelledBy,
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(enrollment, ct);
            return Result<EnrollmentResponse>.Success(enrollment.ToResponse(), 201);
        }
    }
}
