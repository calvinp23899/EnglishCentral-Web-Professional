using EnglishCentral.Infrastructure.Persistence.Seed;

namespace EnglishCentral.Infrastructure.Extensions
{
    public static class DatabaseSeederExtensions
    {
        public static async Task SeedDatabaseAsync(this IServiceProvider services)
        {
            await DatabaseSeeder.SeedAsync(services);
        }
    }
}
