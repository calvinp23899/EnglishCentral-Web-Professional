using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamQuestionResponseConfiguration : IEntityTypeConfiguration<ExamQuestionResponse>
    {
        public void Configure(EntityTypeBuilder<ExamQuestionResponse> builder)
        {
            builder.ToTable("exam_question_responses", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamAttemptId, x.ExamQuestionId }).IsUnique();
            builder.HasIndex(x => x.ExamSectionAttemptId);
            builder.HasIndex(x => x.ExamAnswerOptionId);
            builder.HasIndex(x => x.ReviewStatus);

            builder.Property(x => x.AnswerText).HasColumnType("text");
            builder.Property(x => x.AnswerJson).HasColumnType("text");
            builder.Property(x => x.Score).HasPrecision(18, 2);
            builder.Property(x => x.ReviewStatus).HasConversion<int>();
            builder.Property(x => x.Feedback).HasColumnType("text");

            builder.HasOne(x => x.ExamAttempt)
                .WithMany(x => x.Responses)
                .HasForeignKey(x => x.ExamAttemptId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ExamSectionAttempt)
                .WithMany(x => x.Responses)
                .HasForeignKey(x => x.ExamSectionAttemptId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ExamQuestion)
                .WithMany(x => x.Responses)
                .HasForeignKey(x => x.ExamQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ExamAnswerOption)
                .WithMany(x => x.Responses)
                .HasForeignKey(x => x.ExamAnswerOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
