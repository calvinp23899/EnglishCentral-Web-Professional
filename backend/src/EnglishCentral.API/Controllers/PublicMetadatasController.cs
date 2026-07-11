using EnglishCentral.Domain.Enums.Exam;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicMetadatasController : BaseController
    {

        [HttpGet("get-exam-attempt-mode")]
        public IActionResult GetMetadataExamAttemptMode() => Ok(GetEnumMetadata<EExamAttemptMode>());
    }
}
