using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.CRM
{
    internal static class LeadSourceSeeder
    {
        private const string WebsiteContactCode = "WEBSITE_CONTACT";

        public static async Task SeedAsync(ApplicationDbContext context)
        {
            var exists = await context.LeadSources
                .AnyAsync(x => x.Code == WebsiteContactCode);

            if (exists)
                return;

            await context.LeadSources.AddAsync(new LeadSource
            {
                Code = WebsiteContactCode,
                Name = "Website Contact",
                Channel = ELeadSourceChannel.Organic,
                Description = "Lead created from the public website contact or consultation registration form.",
                IsActive = true,
                CreatedBy = SystemDefault.DefaultSystemNumber,
                IsSystemDefault = true,
            });

            await context.SaveChangesAsync();
        }
    }
}
