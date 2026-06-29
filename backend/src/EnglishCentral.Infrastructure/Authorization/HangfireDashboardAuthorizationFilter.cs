using EnglishCentral.Shared.Constants;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.DataProtection;
using System.Globalization;

namespace EnglishCentral.Infrastructure.Authorization
{
    public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public const string CookieName = "HangfireDashboardAuth";
        public const string DataProtectionPurpose = "EnglishCentral.HangfireDashboardAuth.v1";

        private readonly IDataProtector _protector;

        public HangfireDashboardAuthorizationFilter(IDataProtectionProvider dataProtectionProvider)
        {
            _protector = dataProtectionProvider.CreateProtector(DataProtectionPurpose);
        }

        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            if (httpContext.User.Identity?.IsAuthenticated == true &&
                httpContext.User.HasClaim("permission", SystemPermissions.BillingRead))
            {
                return true;
            }

            var protectedValue = httpContext.Request.Cookies[CookieName];
            if (string.IsNullOrWhiteSpace(protectedValue))
                return false;

            try
            {
                var value = _protector.Unprotect(protectedValue);
                var parts = value.Split('|');
                if (parts.Length != 2)
                    return false;

                if (!long.TryParse(parts[0], NumberStyles.Integer, CultureInfo.InvariantCulture, out var expiresAtUnix))
                    return false;

                var expiresAt = DateTimeOffset.FromUnixTimeSeconds(expiresAtUnix);
                return expiresAt > DateTimeOffset.UtcNow &&
                       parts[1].Split(',').Contains(SystemPermissions.BillingRead);
            }
            catch
            {
                return false;
            }
        }
    }
}
