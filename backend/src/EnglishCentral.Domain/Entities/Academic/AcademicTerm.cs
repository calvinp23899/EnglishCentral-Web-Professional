using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class AcademicTerm : BaseEntity
    {
        public string Name { get; set; } = default!;

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public bool IsActive { get; set; }

        // Navigation

        public ICollection<Class> Classes { get; set; } = [];
    }
}
