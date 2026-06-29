using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamQuestionConfiguration : IEntityTypeConfiguration<ExamQuestion>
    {
        public void Configure(EntityTypeBuilder<ExamQuestion> builder)
        {
            builder.ToTable("exam_questions", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamQuestionGroupId, x.Code }).IsUnique();
            builder.HasIndex(x => new { x.ExamQuestionGroupId, x.OrderIndex }).IsUnique();
            builder.HasIndex(x => x.QuestionType);

            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Prompt).HasColumnType("text");
            builder.Property(x => x.QuestionType).HasConversion<int>();
            builder.Property(x => x.Points).HasPrecision(18, 2);
            builder.Property(x => x.Explanation).HasColumnType("text");
            builder.Property(x => x.MetadataJson).HasColumnType("text");

            builder.HasOne(x => x.ExamQuestionGroup)
                .WithMany(x => x.Questions)
                .HasForeignKey(x => x.ExamQuestionGroupId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
