using EnglishCentral.Application.Features.CRM.LeadConversions.Queries.GetLeadConversionById;
using EnglishCentral.Application.Features.CRM.LeadConversions.Queries.GetLeadConversions;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.CRM
{
    [Route("api/admin/crm/lead-conversions")]
    [ApiController]
    public class LeadConversionsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public LeadConversionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.CRMRead)]
        public async Task<IActionResult> GetList([FromQuery] GetLeadConversionsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.CRMRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetLeadConversionByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
