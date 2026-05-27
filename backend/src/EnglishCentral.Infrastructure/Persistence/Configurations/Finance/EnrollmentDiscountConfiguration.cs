using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class EnrollmentDiscountConfiguration : IEntityTypeConfiguration<EnrollmentDiscount>
    {
        public void Configure(EntityTypeBuilder<EnrollmentDiscount> builder)
        {
            builder.ToTable("enrollment_discounts", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.EnrollmentId);
            builder.HasIndex(x => x.DiscountId);
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Type).HasConversion<int>();
            builder.Property(x => x.Value).HasPrecision(18, 2);
            builder.Property(x => x.Amount).HasPrecision(18, 2);
            builder.Property(x => x.Reason).HasMaxLength(1000);
            builder.HasOne(x => x.Enrollment).WithMany(x => x.Discounts).HasForeignKey(x => x.EnrollmentId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.Discount).WithMany(x => x.EnrollmentDiscounts).HasForeignKey(x => x.DiscountId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}
