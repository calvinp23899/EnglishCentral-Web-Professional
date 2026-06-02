using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Classes.Commands.CreateClass
{
    public class CreateClassCommandHandler : IRequestHandler<CreateClassCommand, Result<ClassResponse>>
    {
        private readonly IAcademicRepository<AcademicClass> _classRepository;
        private readonly IAcademicRepository<Course> _courseRepository;
        private readonly IAcademicRepository<Teacher> _teacherRepository;
        private readonly IAcademicRepository<Room> _roomRepository;
        private readonly IFinanceRepository<BillingPolicy> _billingPolicyRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateClassCommandHandler(
            IAcademicRepository<AcademicClass> classRepository,
            IAcademicRepository<Course> courseRepository,
            IAcademicRepository<Teacher> teacherRepository,
            IAcademicRepository<Room> roomRepository,
            IFinanceRepository<BillingPolicy> billingPolicyRepository,
            IUnitOfWork unitOfWork)
        {
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _teacherRepository = teacherRepository;
            _roomRepository = roomRepository;
            _billingPolicyRepository = billingPolicyRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<ClassResponse>> Handle(CreateClassCommand request, CancellationToken ct)
        {
            var code = request.Code.Trim();
            if (await _classRepository.ExistsAsync(x => x.Code == code, ct))
                return Result<ClassResponse>.Failure("Class code already exists.", 409);

            var course = await _courseRepository.GetByIdAsync(request.CourseId, ct);
            if (course is null)
                return Result<ClassResponse>.Failure("Course is not found.", 404);

            if (!await _teacherRepository.ExistsAsync(x => x.Id == request.TeacherId, ct))
                return Result<ClassResponse>.Failure("Teacher is not found.", 404);

            if (request.RoomId.HasValue && !await _roomRepository.ExistsAsync(x => x.Id == request.RoomId.Value, ct))
                return Result<ClassResponse>.Failure("Room is not found.", 404);
            if (request.BillingPolicyId.HasValue &&
                !await _billingPolicyRepository.ExistsAsync(x => x.Id == request.BillingPolicyId.Value && x.IsActive, ct))
                return Result<ClassResponse>.Failure("Active billing policy is not found.", 404);

            var classroom = new AcademicClass
            {
                CourseId = request.CourseId,
                TeacherId = request.TeacherId,
                RoomId = request.RoomId,
                BillingPolicyId = request.BillingPolicyId,
                Code = code,
                Name = request.Name.Trim(),
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Capacity = request.Capacity,
                TuitionFeeSnapshot = request.TuitionFeeSnapshot ?? course.TuitionFee,
                TotalSessions = request.TotalSessions ?? course.TotalSessions,
                CompletedSessions = request.CompletedSessions,
                Status = request.Status,
                OpenedAt = request.OpenedAt,
                ClosedAt = request.ClosedAt,
                Notes = request.Notes?.Trim()
            };

            await _classRepository.AddAsync(classroom, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            return Result<ClassResponse>.Success(classroom.ToResponse(), 201);
        }
    }
}
