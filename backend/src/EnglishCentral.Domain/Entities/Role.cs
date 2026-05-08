using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities
{
    public class Role : BaseEntity
    {
        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = [];

        public ICollection<RolePermission> RolePermissions { get; set; } = [];
    }
}
