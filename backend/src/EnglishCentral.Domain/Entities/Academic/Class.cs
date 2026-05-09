using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Class : BaseEntity
    {
        public long CourseId { get; set; }

        public long TeacherId { get; set; }

        public long AcademicTermId { get; set; }

        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public int Capacity { get; set; }

        public ClassStatus Status { get; set; } = ClassStatus.Draft;

        public string? Notes { get; set; }

        // Navigation

        public Course Course { get; set; } = default!;

        public Teacher Teacher { get; set; } = default!;

        public AcademicTerm AcademicTerm { get; set; } = default!;

        public ICollection<Enrollment> Enrollments { get; set; } = [];

        public ICollection<ClassSchedule> Schedules { get; set; } = [];

        public ICollection<ClassSession> Sessions { get; set; } = [];
    }
}
