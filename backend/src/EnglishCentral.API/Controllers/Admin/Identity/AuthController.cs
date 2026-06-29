using EnglishCentral.Application.Features.Identity.Queries.GetAdminMeProfile;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace EnglishCentral.API.Controllers.Admin.Identity
{
    public class AuthController : AdminBaseController
    {
        private readonly IMediator _mediator;
        private readonly IDataProtector _hangfireAuthProtector;

        public AuthController(IMediator mediator, IDataProtectionProvider dataProtectionProvider)
        {
            _mediator = mediator;
            _hangfireAuthProtector = dataProtectionProvider.CreateProtector(
                HangfireDashboardAuthorizationFilter.DataProtectionPurpose);
        }

        [HttpGet("me-profile")]
        public async Task<IActionResult> GetMeProfile(CancellationToken ct)
        {
            if (CurrentUserPublicId is not { } publicId)
            {
                return Unauthorized(new { error = "Invalid access token." });
            }

            var result = await _mediator.Send(new GetAdminMeProfileQuery(publicId), ct);

            return result.IsSuccess
                ? Ok(result.Data)
                : StatusCode(result.StatusCode, new { error = result.Error });
        }

        [HasPermission(SystemPermissions.BillingRead)]
        [HttpPost("hangfire-login")]
        public IActionResult HangfireLogin()
        {
            var expiresAt = DateTimeOffset.UtcNow.AddHours(2);
            var value = string.Join(
                '|',
                expiresAt.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture),
                SystemPermissions.BillingRead);

            Response.Cookies.Append(
                HangfireDashboardAuthorizationFilter.CookieName,
                _hangfireAuthProtector.Protect(value),
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Expires = expiresAt,
                    Path = "/"
                });

            return Ok(new
            {
                success = true,
                expiresAt,
                dashboardUrl = "/hangfire"
            });
        }

        [HttpPost("hangfire-logout")]
        public IActionResult HangfireLogout()
        {
            Response.Cookies.Delete(
                HangfireDashboardAuthorizationFilter.CookieName,
                new CookieOptions
                {
                    Secure = true,
                    SameSite = SameSiteMode.Lax,
                    Path = "/"
                });

            return Ok(new { success = true });
        }
    }
}
