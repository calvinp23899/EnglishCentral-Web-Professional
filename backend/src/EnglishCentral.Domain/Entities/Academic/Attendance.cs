using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Attendance : BaseEntity
    {
        public long SessionId { get; set; }

        public long StudentId { get; set; }

        public EAttendanceStatus Status { get; set; }

        public DateTimeOffset? CheckedAt { get; set; }

        public long? CheckedBy { get; set; }

        public long? RecordedBy { get; set; }

        public DateTimeOffset? RecordedAt { get; set; }

        public string? AbsenceReason { get; set; }

        public string? Notes { get; set; }

        // Navigation

        public ClassSession Session { get; set; } = default!;

        public Student Student { get; set; } = default!;
    }
}
