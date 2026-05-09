using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EnglishCentral.Infrastructure.Persistence.Context
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }

        #region ---- Identity Module ----
        public DbSet<User> Users => Set<User>();

        public DbSet<Role> Roles => Set<Role>();

        public DbSet<Permission> Permissions => Set<Permission>();

        public DbSet<UserRole> UserRoles => Set<UserRole>();

        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        #endregion

        #region ---- Academic Module ----

        public DbSet<Student> Students => Set<Student>();

        public DbSet<Teacher> Teachers => Set<Teacher>();

        public DbSet<CourseCategory> CourseCategories => Set<CourseCategory>();

        public DbSet<Course> Courses => Set<Course>();

        public DbSet<AcademicTerm> AcademicTerms => Set<AcademicTerm>();

        public DbSet<Room> Rooms => Set<Room>();

        public DbSet<Class> Classes => Set<Class>();

        public DbSet<Enrollment> Enrollments => Set<Enrollment>();

        public DbSet<ClassSchedule> ClassSchedules => Set<ClassSchedule>();

        public DbSet<ClassSession> ClassSessions => Set<ClassSession>();

        public DbSet<Attendance> Attendances => Set<Attendance>();

        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(
                typeof(ApplicationDbContext).Assembly);

            ConfigureSoftDeleteFilter(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }

        /// <summary>
        /// Automatically applies global soft delete query filters
        /// to all entities inheriting from BaseEntity.
        ///
        /// This ensures that records marked as deleted
        /// (IsDeleted = true) are excluded from all queries by default.
        /// If not use, using IgnoreQueryFilters in query context
        /// </summary>
        private static void ConfigureSoftDeleteFilter(ModelBuilder modelBuilder)
        {
            var entityTypes = modelBuilder.Model
                .GetEntityTypes()
                .Where(e => typeof(BaseEntity).IsAssignableFrom(e.ClrType));

            foreach (var entityType in entityTypes)
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(
                        GenerateIsDeletedRestriction(entityType.ClrType));
            }
        }

        /// <summary>
        /// Generates a lambda expression used for the global
        /// soft delete query filter.
        ///
        /// Equivalent to:
        /// entity => entity.IsDeleted == false
        /// </summary>
        private static LambdaExpression GenerateIsDeletedRestriction(Type type)
        {
            var parameter = Expression.Parameter(type, "entity");

            var property = Expression.Property(parameter, nameof(BaseEntity.IsDeleted));

            var condition = Expression.Equal(property, Expression.Constant(false));

            return Expression.Lambda(condition, parameter);
        }
    }
}
