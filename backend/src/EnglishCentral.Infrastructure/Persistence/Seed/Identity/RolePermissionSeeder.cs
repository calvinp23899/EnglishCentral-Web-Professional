using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Identity
{
    public static class RolePermissionSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            var adminRole = await context.Roles
                .FirstAsync(x => x.Name == SystemRoles.Admin);

            var adminPermissions = await context.Permissions.ToListAsync();

            foreach (var permission in adminPermissions)
            {
                var exists = await context.RolePermissions.AnyAsync(x =>
                    x.RoleId == adminRole.Id &&
                    x.PermissionId == permission.Id);

                if (exists)
                    continue;

                await context.RolePermissions.AddAsync(new RolePermission
                {
                    RoleId = adminRole.Id,
                    PermissionId = permission.Id
                });
            }

            await context.SaveChangesAsync();
        }
    }
}
