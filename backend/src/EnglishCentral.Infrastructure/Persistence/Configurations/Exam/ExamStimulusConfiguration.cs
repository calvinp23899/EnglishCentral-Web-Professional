using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamStimulusConfiguration : IEntityTypeConfiguration<ExamStimulus>
    {
        public void Configure(EntityTypeBuilder<ExamStimulus> builder)
        {
            builder.ToTable("exam_stimuli", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamPartId, x.OrderIndex });
            builder.HasIndex(x => x.Type);

            builder.Property(x => x.Type).HasConversion<int>();
            builder.Property(x => x.Title).HasMaxLength(255);
            builder.Property(x => x.Content).HasColumnType("text");
            builder.Property(x => x.AssetUrl).HasMaxLength(1000);
            builder.Property(x => x.Transcript).HasColumnType("text");
            builder.Property(x => x.MetadataJson).HasColumnType("text");

            builder.HasOne(x => x.ExamPart)
                .WithMany(x => x.Stimuli)
                .HasForeignKey(x => x.ExamPartId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
