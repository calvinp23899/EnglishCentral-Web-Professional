using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("payments", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.PaymentNo).IsUnique();
            builder.HasIndex(x => x.StudentId);
            builder.HasIndex(x => x.PaidAt);
            builder.HasIndex(x => x.Status);
            builder.Property(x => x.PaymentNo).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Method).HasConversion<int>();
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.ReferenceCode).HasMaxLength(100);
            builder.Property(x => x.PayerName).HasMaxLength(255);
            builder.Property(x => x.PayerPhone).HasMaxLength(30);
            builder.Property(x => x.Notes).HasMaxLength(2000);

            builder.HasOne(x => x.Student)
                .WithMany(x => x.Payments)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
