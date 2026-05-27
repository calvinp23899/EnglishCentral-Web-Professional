using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Academic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Academic
{
    public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
    {
        public void Configure(EntityTypeBuilder<Attendance> builder)
        {
            builder.ToTable("attendances", DatabaseSchemas.Academic);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId)
                .IsUnique();

            builder.HasIndex(x => new
            {
                x.SessionId,
                x.StudentId
            }).IsUnique();

            builder.HasIndex(x => x.Status);

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.Property(x => x.AbsenceReason)
                .HasMaxLength(1000);

            builder.Property(x => x.Notes)
                .HasMaxLength(1000);

            builder.HasOne(x => x.Session)
                .WithMany(x => x.Attendances)
                .HasForeignKey(x => x.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Student)
                .WithMany(x => x.Attendances)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
