using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Infrastructure.Persistence.Seed.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace EnglishCentral.Infrastructure.Persistence.Seed
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();

            var context = scope.ServiceProvider
                .GetRequiredService<ApplicationDbContext>();

            // Apply pending migrations for local / dev env
            var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
            if (env.IsDevelopment())
            {
                await context.Database.MigrateAsync();
            }

            // Apply Seeding data
            await RoleSeeder.SeedAsync(context);
            await PermissionSeeder.SeedAsync(context);
            await RolePermissionSeeder.SeedAsync(context);
            await AdminSeeder.SeedAsync(context);
        }
    }
}
