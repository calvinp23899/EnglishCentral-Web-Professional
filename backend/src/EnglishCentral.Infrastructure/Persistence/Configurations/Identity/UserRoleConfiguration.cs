using EnglishCentral.Domain.Constants;
using EnglishCentral.Domain.Entities.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EnglishCentral.Infrastructure.Persistence.Configurations.Identity
{
    internal class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> builder)
        {
            builder.ToTable("user_roles", DatabaseSchemas.Identity);

            builder.HasKey(x => new { x.UserId, x.RoleId }); // composite key
        }
    }
}
