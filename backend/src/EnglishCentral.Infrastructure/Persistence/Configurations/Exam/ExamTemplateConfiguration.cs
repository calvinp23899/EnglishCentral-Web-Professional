using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamTemplateConfiguration : IEntityTypeConfiguration<ExamTemplate>
    {
        public void Configure(EntityTypeBuilder<ExamTemplate> builder)
        {
            builder.ToTable("exam_templates", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.Code).IsUnique();
            builder.HasIndex(x => x.ExamTypeId);
            builder.HasIndex(x => x.CurrentVersionId);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.IsActive);

            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(2000);
            builder.Property(x => x.TotalScore).HasPrecision(18, 2);
            builder.Property(x => x.Status).HasConversion<int>();

            builder.HasOne(x => x.ExamType)
                .WithMany(x => x.Templates)
                .HasForeignKey(x => x.ExamTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.CurrentVersion)
                .WithMany()
                .HasForeignKey(x => x.CurrentVersionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
