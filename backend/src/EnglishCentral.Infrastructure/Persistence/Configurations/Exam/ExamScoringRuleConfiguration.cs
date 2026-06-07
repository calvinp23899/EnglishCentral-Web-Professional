using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamScoringRuleConfiguration : IEntityTypeConfiguration<ExamScoringRule>
    {
        public void Configure(EntityTypeBuilder<ExamScoringRule> builder)
        {
            builder.ToTable("exam_scoring_rules", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.ExamVersionId, x.RuleCode }).IsUnique();
            builder.HasIndex(x => x.ExamSectionId);
            builder.HasIndex(x => x.Skill);
            builder.HasIndex(x => x.QuestionType);

            builder.Property(x => x.RuleCode).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Skill).HasConversion<int>();
            builder.Property(x => x.QuestionType).HasConversion<int>();
            builder.Property(x => x.MaxScore).HasPrecision(18, 2);
            builder.Property(x => x.ConfigJson).HasColumnType("text");

            builder.HasOne(x => x.ExamVersion)
                .WithMany(x => x.ScoringRules)
                .HasForeignKey(x => x.ExamVersionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.ExamSection)
                .WithMany()
                .HasForeignKey(x => x.ExamSectionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
