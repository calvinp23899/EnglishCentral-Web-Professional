using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.CRM
{
    public class LeadConfiguration : IEntityTypeConfiguration<Lead>
    {
        public void Configure(EntityTypeBuilder<Lead> builder)
        {
            builder.ToTable("leads", DatabaseSchemas.CRM);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.LeadCode).IsUnique();
            builder.HasIndex(x => x.PhoneNumber);
            builder.HasIndex(x => x.Email);
            builder.HasIndex(x => x.LeadSourceId);
            builder.HasIndex(x => x.AssignedToUserId);
            builder.HasIndex(x => x.InterestedCourseId);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.LostReason);
            builder.HasIndex(x => x.CreatedAt);
            builder.HasIndex(x => x.NextFollowUpAt);
            builder.HasIndex(x => x.ConvertedAt);
            builder.HasIndex(x => x.UtmCampaign);

            builder.Property(x => x.LeadCode)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.FullName)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(30)
                .IsRequired();

            builder.Property(x => x.Email)
                .HasMaxLength(255);

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.Property(x => x.LostReason)
                .HasConversion<int>();

            builder.Property(x => x.DemandNote)
                .HasMaxLength(2000);

            builder.Property(x => x.UtmSource)
                .HasMaxLength(100);

            builder.Property(x => x.UtmMedium)
                .HasMaxLength(100);

            builder.Property(x => x.UtmCampaign)
                .HasMaxLength(255);

            builder.Property(x => x.ReferrerUrl)
                .HasMaxLength(1000);

            builder.Property(x => x.LandingPageUrl)
                .HasMaxLength(1000);

            builder.Property(x => x.LostReasonNote)
                .HasMaxLength(1000);

            builder.HasOne(x => x.LeadSource)
                .WithMany(x => x.Leads)
                .HasForeignKey(x => x.LeadSourceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.AssignedToUser)
                .WithMany()
                .HasForeignKey(x => x.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.InterestedCourse)
                .WithMany()
                .HasForeignKey(x => x.InterestedCourseId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
