using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamAttemptConfiguration : IEntityTypeConfiguration<ExamAttempt>
    {
        public void Configure(EntityTypeBuilder<ExamAttempt> builder)
        {
            builder.ToTable("exam_attempts", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.AttemptCode).IsUnique();
            builder.HasIndex(x => x.ExamVersionId);
            builder.HasIndex(x => x.StudentId);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.StartedAt);
            builder.HasIndex(x => x.SubmittedAt);

            builder.Property(x => x.AttemptCode).HasMaxLength(80).IsRequired();
            builder.Property(x => x.CandidateName).HasMaxLength(255);
            builder.Property(x => x.CandidateEmail).HasMaxLength(255);
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.RawScore).HasPrecision(18, 2);
            builder.Property(x => x.ScaledScore).HasPrecision(18, 2);
            builder.Property(x => x.BandScore).HasPrecision(18, 2);
            builder.Property(x => x.ResultLevel).HasMaxLength(50);
            builder.Property(x => x.RuntimeStateJson).HasColumnType("text");

            builder.HasOne(x => x.ExamVersion)
                .WithMany(x => x.Attempts)
                .HasForeignKey(x => x.ExamVersionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Student)
                .WithMany()
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
