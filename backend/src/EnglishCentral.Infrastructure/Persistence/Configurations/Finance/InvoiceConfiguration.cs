using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.ToTable("invoices", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.InvoiceNo).IsUnique();
            builder.HasIndex(x => x.EnrollmentId);
            builder.HasIndex(x => x.PaymentPlanItemId).IsUnique();
            builder.HasIndex(x => x.DueDate);
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.InvoiceNo).HasMaxLength(50).IsRequired();
            builder.Property(x => x.SubtotalAmount).HasPrecision(18, 2);
            builder.Property(x => x.DiscountAmount).HasPrecision(18, 2);
            builder.Property(x => x.TaxAmount).HasPrecision(18, 2);
            builder.Property(x => x.TotalAmount).HasPrecision(18, 2);
            builder.Property(x => x.PaidAmount).HasPrecision(18, 2);
            builder.Property(x => x.OutstandingAmount).HasPrecision(18, 2);
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.Notes).HasMaxLength(2000);

            builder.HasOne(x => x.Enrollment)
                .WithMany(x => x.Invoices)
                .HasForeignKey(x => x.EnrollmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.PaymentPlanItem)
                .WithOne(x => x.Invoice)
                .HasForeignKey<Invoice>(x => x.PaymentPlanItemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
