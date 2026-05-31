using EnglishCentral.Application.Features.Identity.Queries.GetRoles;
using EnglishCentral.Domain.Enums.Academic;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Metadata
{
    [Route("api/admin/metadata/")]
    [ApiController]
    public class MetadataController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public MetadataController(IMediator mediator)
        {
            _mediator = mediator;
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

        [HttpGet("teacher-status")]
        public IActionResult GetMetadataTeacherStatus()
        {
            var result = GetEnumMetadata<ETeacherStatus>();
            return Ok(result);
        }

        [HttpGet("role-dropdown")]
        public async Task<IActionResult> GetRoleDropdown(CancellationToken ct)
        {
            var result = await _mediator.Send(new GetRoleQuery(), ct);
            return StatusCode(result.StatusCode, result.Data);
        }
    }
}
