using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamVersionConfiguration : IEntityTypeConfiguration<ExamVersion>
    {
        public void Configure(EntityTypeBuilder<ExamVersion> builder)
        {
            builder.ToTable("exam_versions", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamTemplateId, x.VersionNumber }).IsUnique();
            builder.HasIndex(x => new { x.ExamTemplateId, x.VersionCode }).IsUnique();
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.PublishedAt);

            builder.Property(x => x.VersionCode).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(2000);
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.ScoringMode).HasConversion<int>();
            builder.Property(x => x.TotalScore).HasPrecision(18, 2);
            builder.Property(x => x.RuntimeConfigJson).HasColumnType("text");
            builder.Property(x => x.ScoringConfigJson).HasColumnType("text");

            builder.HasOne(x => x.ExamTemplate)
                .WithMany(x => x.Versions)
                .HasForeignKey(x => x.ExamTemplateId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
