using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Identity
{
    public static class RoleSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (await context.Roles.AnyAsync())
                return;

            var roles = new List<Role>
            {
                new()
                {
                    Name = SystemRoles.Admin,
                    Description = "System Administrator",
                    CreatedBy = SystemDefault.DefaultSystemNumber
                },
                new()
                {
                    Name = SystemRoles.BranchManager,
                    Description = "Responsible for managing an English center branch",
                    CreatedBy = SystemDefault.DefaultSystemNumber
                },
                new()
                {
                    Name = SystemRoles.Teacher,
                    Description = "Teacher user",
                    CreatedBy = SystemDefault.DefaultSystemNumber
                },
                new()
                {
                    Name = SystemRoles.HR,
                    Description = "Human Resources user",
                    CreatedBy = SystemDefault.DefaultSystemNumber
                },
                new()
                {
                    Name = SystemRoles.Accountant,
                    Description = "Accounting user",
                    CreatedBy = SystemDefault.DefaultSystemNumber
                },
                new()
                {
                    Name = SystemRoles.Student,
                    Description = "Student user",
                    CreatedBy = SystemDefault.DefaultSystemNumber
                }
            };

            await context.Roles.AddRangeAsync(roles);

            await context.SaveChangesAsync();
        }
    }
}
