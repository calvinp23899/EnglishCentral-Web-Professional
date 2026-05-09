using EnglishCentral.Domain.Common;

namespace EnglishCentral.Domain.Entities.Authentication
{
    public class Permission : BaseEntity
    {
        public string Name { get; set; } = default!;

        public string? Description { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; } = [];
    }
}
