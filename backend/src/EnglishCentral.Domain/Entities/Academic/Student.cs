using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Domain.Entities.Academic
{
    public class Student : BaseEntity
    {
        public long? UserId { get; set; }

        public string StudentCode { get; set; } = default!;

        public string FullName { get; set; } = default!;

        public DateOnly? DateOfBirth { get; set; }

        public Gender Gender { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public string? ParentName { get; set; }

        public string? ParentPhoneNumber { get; set; }

        public DateOnly EnrollmentDate { get; set; }

        public StudentStatus Status { get; set; } = StudentStatus.Active;

        public string? Notes { get; set; }

        // Navigation

        public User? User { get; set; }

        public ICollection<Enrollment> Enrollments { get; set; } = [];

        public ICollection<Attendance> Attendances { get; set; } = [];
    }
}
