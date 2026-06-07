using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamSectionConfiguration : IEntityTypeConfiguration<ExamSection>
    {
        public void Configure(EntityTypeBuilder<ExamSection> builder)
        {
            builder.ToTable("exam_sections", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamVersionId, x.Code }).IsUnique();
            builder.HasIndex(x => new { x.ExamVersionId, x.OrderIndex }).IsUnique();
            builder.HasIndex(x => x.Skill);

            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Skill).HasConversion<int>();
            builder.Property(x => x.MaxScore).HasPrecision(18, 2);
            builder.Property(x => x.Instructions).HasColumnType("text");
            builder.Property(x => x.RuntimeConfigJson).HasColumnType("text");

            builder.HasOne(x => x.ExamVersion)
                .WithMany(x => x.Sections)
                .HasForeignKey(x => x.ExamVersionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
