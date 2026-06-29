using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.CreateAttendance
{
    public class CreateAttendanceCommandHandler : IRequestHandler<CreateAttendanceCommand, Result<AttendanceResponse>>
    {
        private readonly IAcademicRepository<Attendance> _repository;

        public CreateAttendanceCommandHandler(IAcademicRepository<Attendance> repository)
        {
            _repository = repository;
        }

        public async Task<Result<AttendanceResponse>> Handle(CreateAttendanceCommand request, CancellationToken ct)
        {
            if (await _repository.ExistsAsync(x => x.SessionId == request.SessionId && x.StudentId == request.StudentId, ct))
                return Result<AttendanceResponse>.Failure("Attendance already exists for this session and student.", 409);

            var attendance = new Attendance
            {
                SessionId = request.SessionId,
                StudentId = request.StudentId,
                Status = request.Status,
                CheckedAt = request.CheckedAt,
                CheckedBy = request.CheckedBy,
                RecordedAt = request.RecordedAt ?? DateTimeOffset.UtcNow,
                RecordedBy = request.RecordedBy,
                AbsenceReason = request.AbsenceReason?.Trim(),
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(attendance, ct);
            return Result<AttendanceResponse>.Success(attendance.ToResponse(), 201);
        }
    }
}
