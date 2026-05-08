namespace EnglishCentral.Domain.Entities
{
    public class RolePermission
    {
        public long RoleId { get; set; }

        public Role Role { get; set; } = default!;

        public long PermissionId { get; set; }

        public Permission Permission { get; set; } = default!;
    }
}
