using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamSectionAttemptConfiguration : IEntityTypeConfiguration<ExamSectionAttempt>
    {
        public void Configure(EntityTypeBuilder<ExamSectionAttempt> builder)
        {
            builder.ToTable("exam_section_attempts", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamAttemptId, x.ExamSectionId }).IsUnique();
            builder.HasIndex(x => x.Status);

            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.RawScore).HasPrecision(18, 2);
            builder.Property(x => x.ScaledScore).HasPrecision(18, 2);
            builder.Property(x => x.BandScore).HasPrecision(18, 2);

            builder.HasOne(x => x.ExamAttempt)
                .WithMany(x => x.SectionAttempts)
                .HasForeignKey(x => x.ExamAttemptId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ExamSection)
                .WithMany(x => x.SectionAttempts)
                .HasForeignKey(x => x.ExamSectionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
