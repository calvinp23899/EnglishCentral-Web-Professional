using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class InvoiceDiscountConfiguration : IEntityTypeConfiguration<InvoiceDiscount>
    {
        public void Configure(EntityTypeBuilder<InvoiceDiscount> builder)
        {
            builder.ToTable("invoice_discounts", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.InvoiceId);
            builder.HasIndex(x => x.EnrollmentDiscountId);
            builder.HasIndex(x => x.DiscountId);
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Type).HasConversion<int>();
            builder.Property(x => x.Value).HasPrecision(18, 2);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Reason).HasMaxLength(1000);
            builder.HasOne(x => x.Invoice).WithMany(x => x.Discounts).HasForeignKey(x => x.InvoiceId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.EnrollmentDiscount).WithMany().HasForeignKey(x => x.EnrollmentDiscountId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Discount).WithMany(x => x.InvoiceDiscounts).HasForeignKey(x => x.DiscountId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
