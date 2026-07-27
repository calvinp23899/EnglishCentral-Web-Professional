using EnglishCentral.Application.Features.CRM.Leads.Commands.ConvertLead;
using EnglishCentral.Application.Features.CRM.Leads.Commands.CreateLead;
using EnglishCentral.Application.Features.CRM.Leads.Commands.CreateLeadActivity;
using EnglishCentral.Application.Features.CRM.Leads.Commands.DeleteLead;
using EnglishCentral.Application.Features.CRM.Leads.Commands.MarkLeadLost;
using EnglishCentral.Application.Features.CRM.Leads.Commands.UpdateLead;
using EnglishCentral.Application.Features.CRM.Leads.Queries.GetLeadById;
using EnglishCentral.Application.Features.CRM.Leads.Queries.GetLeads;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.CRM
{
    [Route("api/admin/crm/leads")]
    [ApiController]
    public class LeadsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public LeadsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.CRMRead)]
        public async Task<IActionResult> GetList([FromQuery] GetLeadsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.CRMRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetLeadByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.CRMCreate)]
        public async Task<IActionResult> Create(CreateLeadCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.CRMUpdate)]
        public async Task<IActionResult> Update(long id, UpdateLeadCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id:long}/activities/insert")]
        [HasPermission(SystemPermissions.CRMUpdate)]
        public async Task<IActionResult> CreateActivity(long id, CreateLeadActivityCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { LeadId = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id:long}/mark-lost")]
        [HasPermission(SystemPermissions.CRMUpdate)]
        public async Task<IActionResult> MarkLost(long id, MarkLeadLostCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { LeadId = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id:long}/convert")]
        [HasPermission(SystemPermissions.CRMUpdate)]
        public async Task<IActionResult> Convert(long id, ConvertLeadCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { LeadId = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.CRMDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteLeadCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
