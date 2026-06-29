using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamAnswerKeyConfiguration : IEntityTypeConfiguration<ExamAnswerKey>
    {
        public void Configure(EntityTypeBuilder<ExamAnswerKey> builder)
        {
            builder.ToTable("exam_answer_keys", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamQuestionId, x.OrderIndex });
            builder.HasIndex(x => x.ExamAnswerOptionId);

            builder.Property(x => x.CorrectValue).HasMaxLength(1000);
            builder.Property(x => x.MatchPattern).HasMaxLength(1000);
            builder.Property(x => x.Score).HasPrecision(18, 2);

            builder.HasOne(x => x.ExamQuestion)
                .WithMany(x => x.AnswerKeys)
                .HasForeignKey(x => x.ExamQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ExamAnswerOption)
                .WithMany(x => x.AnswerKeys)
                .HasForeignKey(x => x.ExamAnswerOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
