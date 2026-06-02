using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Classes.Commands.UpdateClass
{
    public class UpdateClassCommandHandler : IRequestHandler<UpdateClassCommand, Result<ClassResponse>>
    {
        private readonly IAcademicRepository<AcademicClass> _repository;
        private readonly IAcademicRepository<Course> _courseRepository;
        private readonly IAcademicRepository<Teacher> _teacherRepository;
        private readonly IAcademicRepository<Room> _roomRepository;

        public UpdateClassCommandHandler(
            IAcademicRepository<AcademicClass> repository,
            IAcademicRepository<Course> courseRepository,
            IAcademicRepository<Teacher> teacherRepository,
            IAcademicRepository<Room> roomRepository)
        {
            _repository = repository;
            _courseRepository = courseRepository;
            _teacherRepository = teacherRepository;
            _roomRepository = roomRepository;
        }

        public async Task<Result<ClassResponse>> Handle(UpdateClassCommand request, CancellationToken ct)
        {
            var classroom = await _repository.GetByIdAsync(request.Id, ct);
            if (classroom is null)
                return Result<ClassResponse>.Failure("Class is not found.", 404);

            var code = request.Code.Trim();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Code == code, ct))
                return Result<ClassResponse>.Failure("Class code already exists.", 409);

            if (!await _courseRepository.ExistsAsync(x => x.Id == request.CourseId, ct))
                return Result<ClassResponse>.Failure("Course is not found.", 404);

            if (!await _teacherRepository.ExistsAsync(x => x.Id == request.TeacherId, ct))
                return Result<ClassResponse>.Failure("Teacher is not found.", 404);

            if (request.RoomId.HasValue && !await _roomRepository.ExistsAsync(x => x.Id == request.RoomId.Value, ct))
                return Result<ClassResponse>.Failure("Room is not found.", 404);

            classroom.CourseId = request.CourseId;
            classroom.TeacherId = request.TeacherId;
            classroom.RoomId = request.RoomId;
            classroom.Code = code;
            classroom.Name = request.Name.Trim();
            classroom.StartDate = request.StartDate;
            classroom.EndDate = request.EndDate;
            classroom.Capacity = request.Capacity;
            classroom.TuitionFeeSnapshot = request.TuitionFeeSnapshot ?? classroom.TuitionFeeSnapshot;
            classroom.TotalSessions = request.TotalSessions ?? classroom.TotalSessions;
            classroom.CompletedSessions = request.CompletedSessions;
            classroom.Status = request.Status;
            classroom.OpenedAt = request.OpenedAt;
            classroom.ClosedAt = request.ClosedAt;
            classroom.Notes = request.Notes?.Trim();
            classroom.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<ClassResponse>.Success(classroom.ToResponse());
        }
    }
}
