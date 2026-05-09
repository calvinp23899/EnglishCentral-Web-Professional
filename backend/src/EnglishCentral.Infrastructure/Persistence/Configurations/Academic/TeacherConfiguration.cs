using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Academic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Academic
{
    public class TeacherConfiguration : IEntityTypeConfiguration<Teacher>
    {
        public void Configure(EntityTypeBuilder<Teacher> builder)
        {
            builder.ToTable("teachers", DatabaseSchemas.Academic);

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId)
                .IsUnique();

            builder.HasIndex(x => x.TeacherCode)
                .IsUnique();

            builder.HasIndex(x => x.UserId)
                .IsUnique();

            builder.HasIndex(x => x.Email);

            builder.Property(x => x.TeacherCode)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.FullName)
                .HasMaxLength(255)
                .IsRequired();

            builder.Property(x => x.Email)
                .HasMaxLength(255);

            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(20);

            builder.Property(x => x.Specialization)
                .HasMaxLength(255);

            builder.Property(x => x.Status)
                .HasConversion<int>();

            builder.HasOne(x => x.User)
                .WithOne()
                .HasForeignKey<Teacher>(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
