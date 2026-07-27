using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.CRM
{
    public class LeadActivityConfiguration : IEntityTypeConfiguration<LeadActivity>
    {
        public void Configure(EntityTypeBuilder<LeadActivity> builder)
        {
            builder.ToTable("lead_activities", DatabaseSchemas.CRM);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.LeadId);
            builder.HasIndex(x => x.ActivityType);
            builder.HasIndex(x => x.CreatedByUserId);
            builder.HasIndex(x => x.CreatedAt);
            builder.HasIndex(x => x.NextFollowUpAt);

            builder.Property(x => x.ActivityType)
                .HasConversion<int>();

            builder.Property(x => x.Note)
                .HasMaxLength(2000);

            builder.Property(x => x.Outcome)
                .HasMaxLength(1000);

            builder.HasOne(x => x.Lead)
                .WithMany(x => x.Activities)
                .HasForeignKey(x => x.LeadId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
