using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Infrastructure.Persistence;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Infrastructure.Persistence.Repositories.Academic;
using EnglishCentral.Infrastructure.Persistence.Repositories.Academic.TeacherRepo;
using EnglishCentral.Infrastructure.Persistence.Repositories.Identity;
using EnglishCentral.Infrastructure.Services.Identity;
using EnglishCentral.Infrastructure.Services.Identity.Models;
using EnglishCentral.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EnglishCentral.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDIInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            #region Database Connection
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            #endregion

            #region Authorization
            services.AddAuthorization(options =>
            {
                var permissions = GetAllPermissions();

                foreach (var permission in permissions)
                {
                    options.AddPolicy(
                        $"Permission:{permission}",
                        policy =>
                        {
                            policy.Requirements.Add(
                                new PermissionRequirement(
                                    permission));
                        });
                }
            });
            services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
            #endregion

            #region Repositories DI


            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPasswordService, PasswordService>();
            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IStudentRepository, StudentRepository>();
            services.AddScoped<ITeacherRepository, TeacherRepository>();
            services.AddScoped(typeof(IAcademicRepository<>), typeof(AcademicRepository<>));
            #endregion

            #region JWT Setting
            services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
            #endregion

            return services;
        }

        private static List<string> GetAllPermissions()
        {
            return
            [
                SystemPermissions.StudentRead,
                SystemPermissions.StudentDelete,
                SystemPermissions.StudentCreate,
                SystemPermissions.StudentUpdate,

                SystemPermissions.TeacherRead,
                SystemPermissions.TeacherUpdate,
                SystemPermissions.TeacherDelete,
                SystemPermissions.TeacherCreate,

                SystemPermissions.CourseCreate,
                SystemPermissions.CourseDelete,
                SystemPermissions.CourseRead,
                SystemPermissions.CourseUpdate,

                SystemPermissions.CourseCategoryRead,
                SystemPermissions.CourseCategoryCreate,
                SystemPermissions.CourseCategoryUpdate,
                SystemPermissions.CourseCategoryDelete,

                SystemPermissions.RoomRead,
                SystemPermissions.RoomCreate,
                SystemPermissions.RoomUpdate,
                SystemPermissions.RoomDelete,

                SystemPermissions.ClassRead,
                SystemPermissions.ClassCreate,
                SystemPermissions.ClassUpdate,
                SystemPermissions.ClassDelete,

                SystemPermissions.ClassScheduleRead,
                SystemPermissions.ClassScheduleCreate,
                SystemPermissions.ClassScheduleUpdate,
                SystemPermissions.ClassScheduleDelete,

                SystemPermissions.ClassSessionRead,
                SystemPermissions.ClassSessionCreate,
                SystemPermissions.ClassSessionUpdate,
                SystemPermissions.ClassSessionDelete,

                SystemPermissions.EnrollmentRead,
                SystemPermissions.EnrollmentCreate,
                SystemPermissions.EnrollmentUpdate,
                SystemPermissions.EnrollmentDelete,

                SystemPermissions.AttendanceRead,
                SystemPermissions.AttendanceCreate,
                SystemPermissions.AttendanceUpdate,
                SystemPermissions.AttendanceDelete,
            ];
        }
    }

}
