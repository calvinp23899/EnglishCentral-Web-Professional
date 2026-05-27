using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class EnrollmentPaymentPlanItemConfiguration : IEntityTypeConfiguration<EnrollmentPaymentPlanItem>
    {
        public void Configure(EntityTypeBuilder<EnrollmentPaymentPlanItem> builder)
        {
            builder.ToTable("enrollment_payment_plan_items", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.PaymentPlanId);
            builder.HasIndex(x => new { x.PaymentPlanId, x.SequenceNumber }).IsUnique();
            builder.HasIndex(x => x.DueDate);
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Status).HasConversion<int>();

            builder.HasOne(x => x.PaymentPlan)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.PaymentPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
