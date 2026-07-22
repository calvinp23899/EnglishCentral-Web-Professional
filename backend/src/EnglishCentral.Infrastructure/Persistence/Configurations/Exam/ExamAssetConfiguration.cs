using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Exam;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Exam
{
    public class ExamAssetConfiguration : IEntityTypeConfiguration<ExamAsset>
    {
        public void Configure(EntityTypeBuilder<ExamAsset> builder)
        {
            builder.ToTable("exam_assets", DatabaseSchemas.Exam);
            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId).IsUnique();
            builder.HasIndex(x => new { x.Provider, x.BucketName, x.ObjectKey }).IsUnique();
            builder.HasIndex(x => x.AssetType);
            builder.HasIndex(x => x.Provider);
            builder.HasIndex(x => x.Status);
            builder.HasIndex(x => x.CreatedAt);
            builder.HasIndex(x => x.IsDeleted);

            builder.Property(x => x.AssetType).HasConversion<int>();
            builder.Property(x => x.Provider).HasConversion<int>();
            builder.Property(x => x.Status).HasConversion<int>();
            builder.Property(x => x.BucketName).HasMaxLength(255).IsRequired();
            builder.Property(x => x.ObjectKey).HasMaxLength(1000).IsRequired();
            builder.Property(x => x.PublicUrl).HasMaxLength(1000).IsRequired();
            builder.Property(x => x.OriginalFileName).HasMaxLength(255).IsRequired();
            builder.Property(x => x.ContentType).HasMaxLength(150).IsRequired();
            builder.Property(x => x.Checksum).HasMaxLength(128);
            builder.Property(x => x.MetadataJson).HasColumnType("text");
        }
    }
}
