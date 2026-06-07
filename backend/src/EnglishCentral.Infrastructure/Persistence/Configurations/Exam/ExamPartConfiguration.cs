using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamPartConfiguration : IEntityTypeConfiguration<ExamPart>
    {
        public void Configure(EntityTypeBuilder<ExamPart> builder)
        {
            builder.ToTable("exam_parts", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamSectionId, x.Code }).IsUnique();
            builder.HasIndex(x => new { x.ExamSectionId, x.OrderIndex }).IsUnique();

            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Instructions).HasColumnType("text");
            builder.Property(x => x.LayoutConfigJson).HasColumnType("text");

            builder.HasOne(x => x.ExamSection)
                .WithMany(x => x.Parts)
                .HasForeignKey(x => x.ExamSectionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
