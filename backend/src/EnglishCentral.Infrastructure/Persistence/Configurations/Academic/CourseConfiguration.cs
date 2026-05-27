using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Academic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Academic
{
    public class CourseConfiguration : IEntityTypeConfiguration<Course>
    {
        public void Configure(EntityTypeBuilder<Course> builder)
        {
            builder.ToTable("courses", DatabaseSchemas.Academic);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId)
                .IsUnique();

            builder.HasIndex(x => x.Code)
                .IsUnique();

            builder.HasIndex(x => x.CourseCategoryId);

            builder.HasIndex(x => x.Level);

            builder.HasIndex(x => x.DisplayOrder);

            builder.Property(x => x.Code)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Name)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(x => x.Description)
                .HasMaxLength(2000);

            builder.Property(x => x.Level)
                .HasMaxLength(100);

            builder.Property(x => x.TuitionFee)
                .HasPrecision(18, 2);

            builder.HasOne(x => x.CourseCategory)
                .WithMany(x => x.Courses)
                .HasForeignKey(x => x.CourseCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
