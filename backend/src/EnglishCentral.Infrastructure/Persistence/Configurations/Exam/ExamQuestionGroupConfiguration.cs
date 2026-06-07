using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamQuestionGroupConfiguration : IEntityTypeConfiguration<ExamQuestionGroup>
    {
        public void Configure(EntityTypeBuilder<ExamQuestionGroup> builder)
        {
            builder.ToTable("exam_question_groups", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamPartId, x.Code }).IsUnique();
            builder.HasIndex(x => new { x.ExamPartId, x.OrderIndex });
            builder.HasIndex(x => x.ExamStimulusId);
            builder.HasIndex(x => x.QuestionType);

            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Title).HasMaxLength(255);
            builder.Property(x => x.Instructions).HasColumnType("text");
            builder.Property(x => x.QuestionType).HasConversion<int>();
            builder.Property(x => x.ConfigJson).HasColumnType("text");

            builder.HasOne(x => x.ExamPart)
                .WithMany(x => x.QuestionGroups)
                .HasForeignKey(x => x.ExamPartId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ExamStimulus)
                .WithMany(x => x.QuestionGroups)
                .HasForeignKey(x => x.ExamStimulusId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
