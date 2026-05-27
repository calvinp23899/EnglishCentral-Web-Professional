using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class ReceiptConfiguration : IEntityTypeConfiguration<Receipt>
    {
        public void Configure(EntityTypeBuilder<Receipt> builder)
        {
            builder.ToTable("receipts", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.PaymentId).IsUnique();
            builder.HasIndex(x => x.ReceiptNo).IsUnique();
            builder.Property(x => x.ReceiptNo).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Notes).HasMaxLength(2000);

            builder.HasOne(x => x.Payment)
                .WithOne(x => x.Receipt)
                .HasForeignKey<Receipt>(x => x.PaymentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
