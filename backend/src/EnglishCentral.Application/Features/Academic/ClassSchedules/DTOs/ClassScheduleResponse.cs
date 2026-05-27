using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs
{
    public record ClassScheduleResponse(
        Guid PublicId,
        long Id,
        long ClassId,
        DayOfWeek DayOfWeek,
        TimeOnly StartTime,
        TimeOnly EndTime,
        DateOnly EffectiveFrom,
        DateOnly EffectiveTo);

    public static class ClassScheduleMapping
    {
        public static ClassScheduleResponse ToResponse(this ClassSchedule schedule)
        {
            return new ClassScheduleResponse(
                schedule.PublicId,
                schedule.Id,
                schedule.ClassId,
                schedule.DayOfWeek,
                schedule.StartTime,
                schedule.EndTime,
                schedule.EffectiveFrom,
                schedule.EffectiveTo);
        }
    }
}
