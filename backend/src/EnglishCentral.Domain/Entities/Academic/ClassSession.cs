using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class ClassSession : BaseEntity
    {
        public long ClassId { get; set; }

        public long TeacherId { get; set; }

        public long? SubstituteTeacherId { get; set; }

        public long RoomId { get; set; }

        public int SessionNumber { get; set; }

        public DateOnly SessionDate { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public DateTimeOffset? StartedAt { get; set; }

        public DateTimeOffset? EndedAt { get; set; }

        public SessionStatus Status { get; set; } = SessionStatus.Scheduled;

        public string? CancellationReason { get; set; }

        public bool IsPayrollLocked { get; set; }

        public string? Notes { get; set; }

        // Navigation

        public Class Class { get; set; } = default!;

        public Teacher Teacher { get; set; } = default!;

        public Teacher? SubstituteTeacher { get; set; }

        public Room Room { get; set; } = default!;

        public ICollection<Attendance> Attendances { get; set; } = [];
    }
}
