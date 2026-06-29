using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.RecordBulkAttendance
{
    public class RecordBulkAttendanceCommandHandler : IRequestHandler<RecordBulkAttendanceCommand, Result<bool>>
    {
        private readonly IAcademicRepository<Attendance> _repository;

        public RecordBulkAttendanceCommandHandler(IAcademicRepository<Attendance> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(RecordBulkAttendanceCommand request, CancellationToken ct)
        {
            foreach (var item in request.Items)
            {
                var attendance = await _repository.FirstOrDefaultAsync(
                    x => x.SessionId == request.SessionId && x.StudentId == item.StudentId,
                    ct,
                    asNoTracking: false);

                if (attendance is null)
                {
                    attendance = new Attendance
                    {
                        SessionId = request.SessionId,
                        StudentId = item.StudentId,
                        CreatedAt = DateTimeOffset.UtcNow
                    };
                    await _repository.AddAsync(attendance, ct);
                }

                attendance.Status = item.Status;
                attendance.CheckedAt = item.CheckedAt;
                attendance.CheckedBy = item.CheckedBy;
                attendance.RecordedAt = request.RecordedAt ?? DateTimeOffset.UtcNow;
                attendance.RecordedBy = request.RecordedBy;
                attendance.AbsenceReason = item.AbsenceReason?.Trim();
                attendance.Notes = item.Notes?.Trim();
                attendance.UpdatedAt = DateTimeOffset.UtcNow;
            }

            return Result<bool>.Success(true);
        }
    }
}
