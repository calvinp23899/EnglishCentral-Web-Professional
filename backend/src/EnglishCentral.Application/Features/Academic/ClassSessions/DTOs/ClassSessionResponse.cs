using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.DTOs
{
    public record ClassSessionResponse(
        Guid PublicId,
        long Id,
        long ClassId,
        long TeacherId,
        long? SubstituteTeacherId,
        long RoomId,
        int SessionNumber,
        DateOnly SessionDate,
        TimeOnly StartTime,
        TimeOnly EndTime,
        DateTimeOffset? StartedAt,
        DateTimeOffset? EndedAt,
        ESessionStatus Status,
        string? CancellationReason,
        bool IsPayrollLocked,
        string? Notes);

    public static class ClassSessionMapping
    {
        public static ClassSessionResponse ToResponse(this ClassSession session)
        {
            return new ClassSessionResponse(
                session.PublicId,
                session.Id,
                session.ClassId,
                session.TeacherId,
                session.SubstituteTeacherId,
                session.RoomId,
                session.SessionNumber,
                session.SessionDate,
                session.StartTime,
                session.EndTime,
                session.StartedAt,
                session.EndedAt,
                session.Status,
                session.CancellationReason,
                session.IsPayrollLocked,
                session.Notes);
        }
    }
}
