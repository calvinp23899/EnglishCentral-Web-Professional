using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.CRM;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.CRM
{
    public class LeadConversionConfiguration : IEntityTypeConfiguration<LeadConversion>
    {
        public void Configure(EntityTypeBuilder<LeadConversion> builder)
        {
            builder.ToTable("lead_conversions", DatabaseSchemas.CRM);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.LeadId).IsUnique();
            builder.HasIndex(x => x.StudentId);
            builder.HasIndex(x => x.EnrollmentId);
            builder.HasIndex(x => x.ConvertedByUserId);
            builder.HasIndex(x => x.ConvertedAt);
            builder.HasIndex(x => x.SourceIdSnapshot);
            builder.HasIndex(x => x.ChannelSnapshot);
            builder.HasIndex(x => x.CourseIdSnapshot);

            builder.Property(x => x.SourceNameSnapshot)
                .HasMaxLength(255);

            builder.Property(x => x.ChannelSnapshot)
                .HasMaxLength(100);

            builder.Property(x => x.CourseNameSnapshot)
                .HasMaxLength(255);

            builder.Property(x => x.RevenueSnapshot)
                .HasPrecision(18, 2);

            builder.Property(x => x.Note)
                .HasMaxLength(2000);

            builder.HasOne(x => x.Lead)
                .WithOne(x => x.Conversion)
                .HasForeignKey<LeadConversion>(x => x.LeadId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Student)
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Enrollment)
                .WithMany()
                .HasForeignKey(x => x.EnrollmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ConvertedByUser)
                .WithMany()
                .HasForeignKey(x => x.ConvertedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
