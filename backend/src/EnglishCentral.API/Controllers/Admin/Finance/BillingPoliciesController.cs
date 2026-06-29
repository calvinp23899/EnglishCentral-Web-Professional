using EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.CreateBillingPolicy;
using EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.DeleteBillingPolicy;
using EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.UpdateBillingPolicy;
using EnglishCentral.Application.Features.Finance.BillingPolicies.Queries.GetBillingPolicies;
using EnglishCentral.Application.Features.Finance.BillingPolicies.Queries.GetBillingPolicyById;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/policies")]
    [ApiController]
    public class BillingPoliciesController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public BillingPoliciesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetBillingPoliciesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetBillingPolicyByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.BillingCreate)]
        public async Task<IActionResult> Create(CreateBillingPolicyCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> Update(long id, UpdateBillingPolicyCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.BillingDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteBillingPolicyCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}

