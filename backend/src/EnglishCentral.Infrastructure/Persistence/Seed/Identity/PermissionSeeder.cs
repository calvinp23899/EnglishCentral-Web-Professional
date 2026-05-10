using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Identity
{
    public static class PermissionSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (await context.Permissions.AnyAsync())
                return;
            var permissions = new List<Permission>
            {
                // Students
                new() { Name = "student.read", Description = "View students" , CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "student.create", Description = "Create students", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "student.update", Description = "Update students", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "student.delete", Description = "Delete students", CreatedBy = SystemDefault.DefaultSystemNumber },

                // Teachers
                new() { Name = "teacher.read", Description = "View teachers", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "teacher.create", Description = "Create teachers", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "teacher.update", Description = "Update teachers", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "teacher.delete", Description = "Delete teachers", CreatedBy = SystemDefault.DefaultSystemNumber },

                // Courses
                new() { Name = "course.read", Description = "View courses", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "course.create", Description = "Create courses", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "course.update", Description = "Update courses", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "course.delete", Description = "Delete courses", CreatedBy = SystemDefault.DefaultSystemNumber },

                // Classes
                new() { Name = "class.read", Description = "View classes", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "class.create", Description = "Create classes", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "class.update", Description = "Update classes", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = "class.delete", Description = "Delete classes", CreatedBy = SystemDefault.DefaultSystemNumber }
            };

            await context.Permissions.AddRangeAsync(permissions);
            await context.SaveChangesAsync();
        }
    }
}
