using EnglishCentral.Contracts.Responses.Metadata;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminBaseController : ControllerBase
    {
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

        protected List<MetadataOptionResponse> GetEnumMetadata<T>() where T : struct, Enum
        {
            return Enum.GetValues<T>()
                .Select(x => new MetadataOptionResponse(
                    Label: x.ToString(),
                    Value: x.ToString(),
                    Code: Convert.ToInt32(x)))
                .ToList();
        }
    }
}
