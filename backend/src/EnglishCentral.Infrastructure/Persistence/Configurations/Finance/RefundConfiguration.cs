using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class RefundConfiguration : IEntityTypeConfiguration<Refund>
    {
        public void Configure(EntityTypeBuilder<Refund> builder)
        {
            builder.ToTable("refunds", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.RefundNo).IsUnique();
            builder.HasIndex(x => x.PaymentId);
            builder.HasIndex(x => x.EnrollmentId);
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.RefundNo).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.Method).HasConversion<int>();
            builder.Property(x => x.Reason).HasMaxLength(1000).IsRequired();
            builder.Property(x => x.ReferenceCode).HasMaxLength(100);
            builder.Property(x => x.Notes).HasMaxLength(2000);
            builder.HasOne(x => x.Payment).WithMany(x => x.Refunds).HasForeignKey(x => x.PaymentId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Enrollment).WithMany().HasForeignKey(x => x.EnrollmentId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
