using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Finance
{
    internal static class BillingPolicySeeder
    {
        internal static async Task SeedAsync(ApplicationDbContext context)
        {
            var existingBillingPolicy = await context.BillingPolicies.AnyAsync();

            if (existingBillingPolicy)
                return;

            var defaultPolicy = new BillingPolicy
            {
                PublicId = Guid.NewGuid(),
                Type = EBillingPolicyType.Monthly,
                Name = "Thanh Toán hằng tháng",
                IsDefault = true,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = SystemDefault.DefaultSystemNumber
            };
            await context.BillingPolicies.AddAsync(defaultPolicy);
            await context.SaveChangesAsync();
        }
    }
}
