using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.UpdateAttendance
{
    public class UpdateAttendanceCommandHandler : IRequestHandler<UpdateAttendanceCommand, Result<AttendanceResponse>>
    {
        private readonly IAcademicRepository<Attendance> _repository;

        public UpdateAttendanceCommandHandler(IAcademicRepository<Attendance> repository)
        {
            _repository = repository;
        }

        public async Task<Result<AttendanceResponse>> Handle(UpdateAttendanceCommand request, CancellationToken ct)
        {
            var attendance = await _repository.GetByIdAsync(request.Id, ct);
            if (attendance is null)
                return Result<AttendanceResponse>.Failure("Attendance is not found.", 404);

            attendance.SessionId = request.SessionId;
            attendance.StudentId = request.StudentId;
            attendance.Status = request.Status;
            attendance.CheckedAt = request.CheckedAt;
            attendance.CheckedBy = request.CheckedBy;
            attendance.RecordedAt = request.RecordedAt;
            attendance.RecordedBy = request.RecordedBy;
            attendance.AbsenceReason = request.AbsenceReason?.Trim();
            attendance.Notes = request.Notes?.Trim();
            attendance.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<AttendanceResponse>.Success(attendance.ToResponse());
        }
    }
}
