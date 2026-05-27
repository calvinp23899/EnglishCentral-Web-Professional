using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Finance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Finance
{
    public class BillingPolicyConfiguration : IEntityTypeConfiguration<BillingPolicy>
    {
        public void Configure(EntityTypeBuilder<BillingPolicy> builder)
        {
            builder.ToTable("billing_policies", DatabaseSchemas.Finance);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.Name).IsUnique();
            builder.HasIndex(x => x.Type);
            builder.HasIndex(x => x.IsActive);
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Type).HasConversion<int>();
            builder.Property(x => x.Notes).HasMaxLength(2000);
        }
    }
}
