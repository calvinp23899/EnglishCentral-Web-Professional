using EnglishCentral.Domain.Common;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Entities.Finance;
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

        public DbSet<Room> Rooms => Set<Room>();

        public DbSet<Class> Classes => Set<Class>();

        public DbSet<Enrollment> Enrollments => Set<Enrollment>();

        public DbSet<ClassSchedule> ClassSchedules => Set<ClassSchedule>();

        public DbSet<ClassSession> ClassSessions => Set<ClassSession>();

        public DbSet<Attendance> Attendances => Set<Attendance>();

        #endregion

        #region ---- Finance Module ----

        public DbSet<BillingPolicy> BillingPolicies => Set<BillingPolicy>();

        public DbSet<EnrollmentPaymentPlan> EnrollmentPaymentPlans => Set<EnrollmentPaymentPlan>();

        public DbSet<EnrollmentPaymentPlanItem> EnrollmentPaymentPlanItems => Set<EnrollmentPaymentPlanItem>();

        public DbSet<Invoice> Invoices => Set<Invoice>();

        public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();

        public DbSet<Payment> Payments => Set<Payment>();

        public DbSet<PaymentAllocation> PaymentAllocations => Set<PaymentAllocation>();

        public DbSet<Receipt> Receipts => Set<Receipt>();

        public DbSet<Discount> Discounts => Set<Discount>();

        public DbSet<EnrollmentDiscount> EnrollmentDiscounts => Set<EnrollmentDiscount>();

        public DbSet<InvoiceDiscount> InvoiceDiscounts => Set<InvoiceDiscount>();

        public DbSet<Refund> Refunds => Set<Refund>();

        public DbSet<CreditNote> CreditNotes => Set<CreditNote>();

        public DbSet<CreditNoteApplication> CreditNoteApplications => Set<CreditNoteApplication>();

        public DbSet<BillingLedgerEntry> BillingLedgerEntries => Set<BillingLedgerEntry>();

        #endregion

        #region ---- Exam Module ----

        public DbSet<ExamType> ExamTypes => Set<ExamType>();

        public DbSet<ExamTemplate> ExamTemplates => Set<ExamTemplate>();

        public DbSet<ExamVersion> ExamVersions => Set<ExamVersion>();

        public DbSet<ExamSection> ExamSections => Set<ExamSection>();

        public DbSet<ExamPart> ExamParts => Set<ExamPart>();

        public DbSet<ExamStimulus> ExamStimuli => Set<ExamStimulus>();

        public DbSet<ExamQuestionGroup> ExamQuestionGroups => Set<ExamQuestionGroup>();

        public DbSet<ExamQuestion> ExamQuestions => Set<ExamQuestion>();

        public DbSet<ExamAnswerOption> ExamAnswerOptions => Set<ExamAnswerOption>();

        public DbSet<ExamAnswerKey> ExamAnswerKeys => Set<ExamAnswerKey>();

        public DbSet<ExamScoringRule> ExamScoringRules => Set<ExamScoringRule>();

        public DbSet<ExamAttempt> ExamAttempts => Set<ExamAttempt>();

        public DbSet<ExamSectionAttempt> ExamSectionAttempts => Set<ExamSectionAttempt>();

        public DbSet<ExamQuestionResponse> ExamQuestionResponses => Set<ExamQuestionResponse>();

        public DbSet<ExamReview> ExamReviews => Set<ExamReview>();

        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(
                typeof(ApplicationDbContext).Assembly);

            ConfigureSoftDeleteFilter(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }

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

        private static LambdaExpression GenerateIsDeletedRestriction(Type type)
        {
            var parameter = Expression.Parameter(type, "entity");
            var property = Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
            var condition = Expression.Equal(property, Expression.Constant(false));
            return Expression.Lambda(condition, parameter);
        }
    }
}
