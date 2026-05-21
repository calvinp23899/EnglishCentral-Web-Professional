using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace EnglishCentral.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseController : ControllerBase
    {
        protected const string RefreshTokenCookieName = "refreshToken";

        protected Guid? CurrentUserPublicId
        {
            get
            {
                var userPublicId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                    ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

                return Guid.TryParse(userPublicId, out var publicId)
                    ? publicId
                    : null;
            }
        }

        protected void SetRefreshTokenCookie(string refreshToken, DateTimeOffset expiresAt)
        {
            Response.Cookies.Append(
                RefreshTokenCookieName,
                refreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/",
                    Expires = expiresAt
                });
        }

        protected void ClearRefreshTokenCookie()
        {
            Response.Cookies.Delete(
                RefreshTokenCookieName,
                new CookieOptions
                {
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/"
                });
        }
    }
}
