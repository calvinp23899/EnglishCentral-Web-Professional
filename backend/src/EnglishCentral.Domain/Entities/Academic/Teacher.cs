using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Teacher : BaseEntity
    {
        public long UserId { get; set; }

        public string TeacherCode { get; set; } = default!;

        public string FullName { get; set; } = default!;

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Specialization { get; set; }

        public string? Bio { get; set; }

        public DateOnly HireDate { get; set; }

        public TeacherStatus Status { get; set; } = TeacherStatus.Active;

        // Navigation

        public User User { get; set; } = default!;

        public ICollection<Class> Classes { get; set; } = [];

        public ICollection<ClassSession> Sessions { get; set; } = [];
    }
}
