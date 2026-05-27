using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Course : BaseEntity
    {
        public long CourseCategoryId { get; set; }

        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        public string? Level { get; set; }

        public int DurationWeeks { get; set; }

        public int TotalSessions { get; set; }

        public int SessionDurationMinutes { get; set; }

        public decimal TuitionFee { get; set; }

        public int MaxStudents { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsPublished { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation

        public CourseCategory CourseCategory { get; set; } = default!;

        public ICollection<Class> Classes { get; set; } = [];
    }
}
