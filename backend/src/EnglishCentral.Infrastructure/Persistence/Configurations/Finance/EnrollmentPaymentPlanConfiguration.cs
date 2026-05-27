using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class EnrollmentPaymentPlanConfiguration : IEntityTypeConfiguration<EnrollmentPaymentPlan>
    {
        public void Configure(EntityTypeBuilder<EnrollmentPaymentPlan> builder)
        {
            builder.ToTable("enrollment_payment_plans", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.EnrollmentId).IsUnique();
            builder.HasIndex(x => x.BillingPolicyId);
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.Type).HasConversion<int>();
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
            builder.Property(x => x.Notes).HasMaxLength(2000);

            builder.HasOne(x => x.Enrollment)
                .WithOne(x => x.PaymentPlan)
                .HasForeignKey<EnrollmentPaymentPlan>(x => x.EnrollmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.BillingPolicy)
                .WithMany(x => x.PaymentPlans)
                .HasForeignKey(x => x.BillingPolicyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
