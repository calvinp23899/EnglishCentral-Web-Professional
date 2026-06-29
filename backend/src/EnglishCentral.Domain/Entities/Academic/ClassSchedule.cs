using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class ClassSchedule : BaseEntity
    {
        public long ClassId { get; set; }

        public DayOfWeek DayOfWeek { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public DateOnly EffectiveFrom { get; set; }

        public DateOnly EffectiveTo { get; set; }

        // Navigation

        public Class Class { get; set; } = default!;
    }
}
