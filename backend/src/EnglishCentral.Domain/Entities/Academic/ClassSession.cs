using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class ClassSession : BaseEntity
    {
        public long ClassId { get; set; }

        public long TeacherId { get; set; }

        public long RoomId { get; set; }

        public int SessionNumber { get; set; }

        public DateOnly SessionDate { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public SessionStatus Status { get; set; } = SessionStatus.Scheduled;

        public string? Notes { get; set; }

        // Navigation

        public Class Class { get; set; } = default!;

        public Teacher Teacher { get; set; } = default!;

        public Room Room { get; set; } = default!;

        public ICollection<Attendance> Attendances { get; set; } = [];
    }
}
