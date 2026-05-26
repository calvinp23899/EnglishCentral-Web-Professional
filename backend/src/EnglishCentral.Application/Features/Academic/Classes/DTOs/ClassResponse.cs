using EnglishCentral.Domain.Enums.Academic;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Classes.DTOs
{
    public record ClassResponse(
        Guid PublicId,
        long Id,
        long CourseId,
        long TeacherId,
        long? RoomId,
        string Code,
        string Name,
        DateOnly StartDate,
        DateOnly EndDate,
        int Capacity,
        decimal TuitionFeeSnapshot,
        int TotalSessions,
        int CompletedSessions,
        ClassStatus Status,
        DateTimeOffset? OpenedAt,
        DateTimeOffset? ClosedAt,
        string? Notes);

    public static class ClassMapping
    {
        public static ClassResponse ToResponse(this AcademicClass classroom)
        {
            return new ClassResponse(
                classroom.PublicId,
                classroom.Id,
                classroom.CourseId,
                classroom.TeacherId,
                classroom.RoomId,
                classroom.Code,
                classroom.Name,
                classroom.StartDate,
                classroom.EndDate,
                classroom.Capacity,
                classroom.TuitionFeeSnapshot,
                classroom.TotalSessions,
                classroom.CompletedSessions,
                classroom.Status,
                classroom.OpenedAt,
                classroom.ClosedAt,
                classroom.Notes);
        }
    }
}
