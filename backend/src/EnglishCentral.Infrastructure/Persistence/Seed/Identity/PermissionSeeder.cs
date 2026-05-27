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
            var permissions = new List<Permission>
            {
                // Students
                new() { Name = SystemPermissions.StudentRead, Description = "View students" , CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.StudentCreate, Description = "Create students", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.StudentUpdate, Description = "Update students", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.StudentDelete, Description = "Delete students", CreatedBy = SystemDefault.DefaultSystemNumber },

                // Teachers
                new() { Name = SystemPermissions.TeacherRead, Description = "View teachers", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.TeacherCreate, Description = "Create teachers", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.TeacherUpdate, Description = "Update teachers", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.TeacherDelete, Description = "Delete teachers", CreatedBy = SystemDefault.DefaultSystemNumber },

                // Courses
                new() { Name = SystemPermissions.CourseRead, Description = "View courses", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.CourseCreate, Description = "Create courses", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.CourseUpdate, Description = "Update courses", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.CourseDelete, Description = "Delete courses", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.CourseCategoryRead, Description = "View course categories", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.CourseCategoryCreate, Description = "Create course categories", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.CourseCategoryUpdate, Description = "Update course categories", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.CourseCategoryDelete, Description = "Delete course categories", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.RoomRead, Description = "View rooms", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.RoomCreate, Description = "Create rooms", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.RoomUpdate, Description = "Update rooms", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.RoomDelete, Description = "Delete rooms", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.ClassRead, Description = "View classes", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassCreate, Description = "Create classes", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassUpdate, Description = "Update classes", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassDelete, Description = "Delete classes", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.ClassScheduleRead, Description = "View class schedules", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassScheduleCreate, Description = "Create class schedules", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassScheduleUpdate, Description = "Update class schedules", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassScheduleDelete, Description = "Delete class schedules", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.ClassSessionRead, Description = "View class sessions", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassSessionCreate, Description = "Create class sessions", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassSessionUpdate, Description = "Update class sessions", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.ClassSessionDelete, Description = "Delete class sessions", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.EnrollmentRead, Description = "View enrollments", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.EnrollmentCreate, Description = "Create enrollments", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.EnrollmentUpdate, Description = "Update enrollments", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.EnrollmentDelete, Description = "Delete enrollments", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.AttendanceRead, Description = "View attendances", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.AttendanceCreate, Description = "Create attendances", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.AttendanceUpdate, Description = "Update attendances", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.AttendanceDelete, Description = "Delete attendances", CreatedBy = SystemDefault.DefaultSystemNumber },

                new() { Name = SystemPermissions.BillingRead, Description = "View billing", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.BillingCreate, Description = "Create billing records", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.BillingUpdate, Description = "Update billing records", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.BillingDelete, Description = "Delete billing records", CreatedBy = SystemDefault.DefaultSystemNumber },
                new() { Name = SystemPermissions.BillingPaymentCreate, Description = "Create billing payments", CreatedBy = SystemDefault.DefaultSystemNumber }
            };

            var existingPermissionNames = await context.Permissions
                .Select(x => x.Name)
                .ToListAsync();

            var missingPermissions = permissions
                .Where(x => !existingPermissionNames.Contains(x.Name))
                .ToList();

            if (missingPermissions.Count == 0)
                return;

            await context.Permissions.AddRangeAsync(missingPermissions);
            await context.SaveChangesAsync();
        }
    }
}
