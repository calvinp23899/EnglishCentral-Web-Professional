using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class CourseCategory : BaseEntity
    {
        public string Code { get; set; } = default!;

        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation

        public ICollection<Course> Courses { get; set; } = [];
    }
}
