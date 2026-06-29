using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamAnswerOptionConfiguration : IEntityTypeConfiguration<ExamAnswerOption>
    {
        public void Configure(EntityTypeBuilder<ExamAnswerOption> builder)
        {
            builder.ToTable("exam_answer_options", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamQuestionId, x.Label }).IsUnique();
            builder.HasIndex(x => new { x.ExamQuestionId, x.OrderIndex }).IsUnique();

            builder.Property(x => x.Label).HasMaxLength(20).IsRequired();
            builder.Property(x => x.Content).HasColumnType("text");
            builder.Property(x => x.MetadataJson).HasColumnType("text");

            builder.HasOne(x => x.ExamQuestion)
                .WithMany(x => x.AnswerOptions)
                .HasForeignKey(x => x.ExamQuestionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
