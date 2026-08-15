using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.CRM
{
    public class LeadSourceConfiguration : IEntityTypeConfiguration<LeadSource>
    {
        public void Configure(EntityTypeBuilder<LeadSource> builder)
        {
            builder.ToTable("lead_sources", DatabaseSchemas.CRM);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.Code).IsUnique();
            builder.HasIndex(x => x.Name);
            builder.HasIndex(x => x.Channel);
            builder.HasIndex(x => x.IsActive);

            builder.Property(x => x.Code)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Name)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(x => x.Channel)
                .HasConversion<int>();

            builder.Property(x => x.CampaignName)
                .HasMaxLength(255);

            builder.Property(x => x.Description)
                .HasMaxLength(2000);

            builder.Property(x => x.Cost)
                .HasPrecision(18, 2);

            builder.Property(x => x.IsSystemDefault)
                .HasDefaultValue(false);
        }
    }
}
