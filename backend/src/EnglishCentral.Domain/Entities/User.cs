using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Email { get; set; } = default!;

        public string PasswordHash { get; set; } = default!;

        public string? PhoneNumber { get; set; }

        public string FullName { get; set; } = default!;

        public string? AvatarUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public bool EmailConfirmed { get; set; }

        public DateTimeOffset? LastLoginAt { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = [];
    }
}
