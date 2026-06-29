using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamReviewConfiguration : IEntityTypeConfiguration<ExamReview>
    {
        public void Configure(EntityTypeBuilder<ExamReview> builder)
        {
            builder.ToTable("exam_reviews", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.ExamAttemptId);
            builder.HasIndex(x => x.ReviewerId);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.ReviewedAt);

            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.Score).HasPrecision(18, 2);
            builder.Property(x => x.Feedback).HasColumnType("text");
            builder.Property(x => x.RubricJson).HasColumnType("text");

            builder.HasOne(x => x.ExamAttempt)
                .WithMany(x => x.Reviews)
                .HasForeignKey(x => x.ExamAttemptId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
