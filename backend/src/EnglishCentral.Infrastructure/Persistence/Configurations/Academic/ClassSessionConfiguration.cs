using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Academic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Academic
{
    public class ClassSessionConfiguration : IEntityTypeConfiguration<ClassSession>
    {
        public void Configure(EntityTypeBuilder<ClassSession> builder)
        {
            builder.ToTable("class_sessions", DatabaseSchemas.Academic);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId)
                .IsUnique();

            builder.HasIndex(x => x.ClassId);

            builder.HasIndex(x => x.TeacherId);

            builder.HasIndex(x => x.RoomId);

            builder.HasIndex(x => x.SessionDate);

            builder.HasIndex(x => new
            {
                x.ClassId,
                x.SessionNumber
            }).IsUnique();

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.Property(x => x.Notes)
                .HasMaxLength(2000);

            builder.HasOne(x => x.Class)
                .WithMany(x => x.Sessions)
                .HasForeignKey(x => x.ClassId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Teacher)
                .WithMany(x => x.Sessions)
                .HasForeignKey(x => x.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Room)
                .WithMany(x => x.Sessions)
                .HasForeignKey(x => x.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
