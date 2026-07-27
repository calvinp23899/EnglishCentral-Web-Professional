using EnglishCentral.Application.Features.CRM.LeadSources.Commands.CreateLeadSource;
using EnglishCentral.Application.Features.CRM.LeadSources.Commands.DeleteLeadSource;
using EnglishCentral.Application.Features.CRM.LeadSources.Commands.UpdateLeadSource;
using EnglishCentral.Application.Features.CRM.LeadSources.Queries.GetLeadSourceById;
using EnglishCentral.Application.Features.CRM.LeadSources.Queries.GetLeadSources;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.CRM
{
    [Route("api/admin/crm/lead-sources")]
    [ApiController]
    public class LeadSourcesController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public LeadSourcesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.CRMRead)]
        public async Task<IActionResult> GetList([FromQuery] GetLeadSourcesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.CRMRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetLeadSourceByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.CRMCreate)]
        public async Task<IActionResult> Create(CreateLeadSourceCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.CRMUpdate)]
        public async Task<IActionResult> Update(long id, UpdateLeadSourceCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.CRMDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteLeadSourceCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
