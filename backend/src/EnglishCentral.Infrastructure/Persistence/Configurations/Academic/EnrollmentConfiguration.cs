using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Academic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Academic
{
    public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
    {
        public void Configure(EntityTypeBuilder<Enrollment> builder)
        {
            builder.ToTable("enrollments", DatabaseSchemas.Academic);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId)
                .IsUnique();

            builder.HasIndex(x => new
            {
                x.StudentId,
                x.ClassId
            }).IsUnique();

            builder.HasIndex(x => x.Status);

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.Property(x => x.TuitionFee)
                .HasPrecision(18, 2);

            builder.Property(x => x.DiscountAmount)
                .HasPrecision(18, 2);

            builder.Property(x => x.FinalAmount)
                .HasPrecision(18, 2);

            builder.Property(x => x.Notes)
                .HasMaxLength(2000);

            builder.HasOne(x => x.Student)
                .WithMany(x => x.Enrollments)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Class)
                .WithMany(x => x.Enrollments)
                .HasForeignKey(x => x.ClassId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
