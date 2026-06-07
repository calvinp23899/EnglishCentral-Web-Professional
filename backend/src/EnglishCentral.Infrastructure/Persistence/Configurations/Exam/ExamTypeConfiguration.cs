using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamTypeConfiguration : IEntityTypeConfiguration<ExamType>
    {
        public void Configure(EntityTypeBuilder<ExamType> builder)
        {
            builder.ToTable("exam_types", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);
            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => x.Code).IsUnique();
            builder.HasIndex(x => x.Family);
            builder.HasIndex(x => x.IsActive);

            builder.Property(x => x.Code).HasMaxLength(50).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(255).IsRequired();
            builder.Property(x => x.Family).HasConversion<int>();
            builder.Property(x => x.Description).HasMaxLength(2000);
        }
    }
}
