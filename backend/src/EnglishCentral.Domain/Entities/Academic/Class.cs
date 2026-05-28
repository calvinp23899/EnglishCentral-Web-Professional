using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Class : BaseEntity
    {
        public long CourseId { get; set; }

        public long TeacherId { get; set; }

        public long? RoomId { get; set; }

        public long? BillingPolicyId { get; set; }

        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public int Capacity { get; set; }

        public decimal TuitionFeeSnapshot { get; set; }

        public int TotalSessions { get; set; }

        public int CompletedSessions { get; set; }

        public EClassStatus Status { get; set; } = EClassStatus.Draft;

        public DateTimeOffset? OpenedAt { get; set; }

        public DateTimeOffset? ClosedAt { get; set; }

        public string? Notes { get; set; }

        // Navigation

        public Course Course { get; set; } = default!;

        public Teacher Teacher { get; set; } = default!;

        public Room? Room { get; set; }

        public BillingPolicy? BillingPolicy { get; set; }

        public ICollection<Enrollment> Enrollments { get; set; } = [];

        public ICollection<ClassSchedule> Schedules { get; set; } = [];

        public ICollection<ClassSession> Sessions { get; set; } = [];
    }
}
