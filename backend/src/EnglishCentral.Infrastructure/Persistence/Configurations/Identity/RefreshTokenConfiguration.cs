using EnglishCentral.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Identity
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("refresh_tokens");

            builder.HasKey(x => x.Id);

            builder.HasIndex(x => x.PublicId)
                .IsUnique();

            builder.HasIndex(x => x.UserId);

            builder.Property(x => x.TokenHash)
                .IsRequired();

            builder.Property(x => x.IpAddress)
                .HasMaxLength(100);

            builder.Property(x => x.DeviceInfo)
                .HasMaxLength(500);

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
