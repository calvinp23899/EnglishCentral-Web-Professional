using EnglishCentral.Application.Features.Identity.Commands.Logout;
using EnglishCentral.Application.Features.Identity.Commands.RefreshToken;
using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Application.Features.Identity.Queries.GetAdminMeProfile;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Infrastructure.Services.Identity.Models;
using EnglishCentral.Shared.Constants;
using EnglishCentral.Shared.Results;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Globalization;

namespace EnglishCentral.API.Controllers.Admin.Identity
{
    public class AuthController : AdminBaseController
    {
        private readonly IMediator _mediator;
        private readonly IDataProtector _hangfireAuthProtector;
        private readonly JwtSettings _jwtSettings;


        public AuthController(IMediator mediator, IDataProtectionProvider dataProtectionProvider, IOptions<JwtSettings> jwtOptions)
        {
            _mediator = mediator;
            _hangfireAuthProtector = dataProtectionProvider.CreateProtector(HangfireDashboardAuthorizationFilter.DataProtectionPurpose);
            _jwtSettings = jwtOptions.Value;
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

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(CancellationToken ct)
        {
            var rawRefreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrWhiteSpace(rawRefreshToken))
            {
                return BadRequest(new { error = "Refresh token is required." });
            }

            var command = new LogoutCommand(rawRefreshToken);
            var result = await _mediator.Send(command, ct);

            if (result.IsSuccess)
            {
                ClearRefreshTokenCookie();
                return Ok(result.Data);
            }

            return StatusCode(result.StatusCode, new { error = result.Error });
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(CancellationToken ct)
        {
            var rawRefreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrWhiteSpace(rawRefreshToken))
            {
                return BadRequest(new { error = "Refresh token is required." });
            }

            var command = new RefreshTokenCommand(rawRefreshToken);
            var result = await _mediator.Send(command, ct);

            return ToAuthResponse(result);
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

        private IActionResult ToAuthResponse(Result<AuthTokenResult> result)
        {
            if (!result.IsSuccess || result.Data is null)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            SetRefreshTokenCookie(
                result.Data.RefreshToken,
                DateTimeOffset.UtcNow.AddDays(_jwtSettings.RefreshTokenDays));

            var response = new AuthResponse(
                result.Data.PublicId,
                result.Data.FullName,
                result.Data.Email,
                result.Data.AccessToken,
                result.Data.AccessTokenExpiresAt);

            return StatusCode(result.StatusCode, response);
        }
    }
}
