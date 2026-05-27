using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.Attendances.DTOs
{
    public record AttendanceResponse(
        Guid PublicId,
        long Id,
        long SessionId,
        long StudentId,
        AttendanceStatus Status,
        DateTimeOffset? CheckedAt,
        long? CheckedBy,
        DateTimeOffset? RecordedAt,
        long? RecordedBy,
        string? AbsenceReason,
        string? Notes);

    public static class AttendanceMapping
    {
        public static AttendanceResponse ToResponse(this Attendance attendance)
        {
            return new AttendanceResponse(
                attendance.PublicId,
                attendance.Id,
                attendance.SessionId,
                attendance.StudentId,
                attendance.Status,
                attendance.CheckedAt,
                attendance.CheckedBy,
                attendance.RecordedAt,
                attendance.RecordedBy,
                attendance.AbsenceReason,
                attendance.Notes);
        }
    }
}
