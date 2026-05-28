using EnglishCentral.Domain.Enums.Academic;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/metadata/")]
    [ApiController]
    public class MetadataController : AdminBaseController
    {
        public MetadataController()
        {
        }

        [HttpGet("status")]
        public IActionResult GetMetadataStatus()
        {
            var result = GetEnumMetadata<EStatus>();
            return Ok(result);
        }

        [HttpGet("gender-status")]
        public IActionResult GetMetadataGenderStatus()
        {
            var result = GetEnumMetadata<EGender>();
            return Ok(result);
        }
    }
}
