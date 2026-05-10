using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Identity
{
    public static class AdminSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            const string adminEmail = "admin@englishcentral.com";

            var existingAdmin = await context.Users
                .Include(x => x.UserRoles)
                .FirstOrDefaultAsync(x => x.Email == adminEmail);

            if (existingAdmin is not null)
                return;

            var adminRole = await context.Roles
                    .FirstOrDefaultAsync(x => x.Name == SystemRoles.Admin);
            if (adminRole is null)
                return;
            var adminUser = new User
            {
                PublicId = Guid.NewGuid(),
                FullName = "System Administrator",
                Email = adminEmail,
                //TODO: set up password in config/env on production
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    "Admin@123",
                    workFactor: 10),
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = SystemDefault.DefaultSystemNumber
            };

            adminUser.UserRoles.Add(new UserRole
            {
                RoleId = adminRole.Id,
                User = adminUser
            });

            await context.Users.AddAsync(adminUser);

            await context.SaveChangesAsync();
        }
    }
}
