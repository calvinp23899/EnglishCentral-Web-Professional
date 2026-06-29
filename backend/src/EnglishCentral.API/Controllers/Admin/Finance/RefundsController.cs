using EnglishCentral.Application.Features.Finance.Refunds.Commands.CreateRefund;
using EnglishCentral.Application.Features.Finance.Refunds.Queries.GetRefundById;
using EnglishCentral.Application.Features.Finance.Refunds.Queries.GetRefunds;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/refunds")]
    [ApiController]
    public class RefundsController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public RefundsController(IMediator mediator) => _mediator = mediator;
        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetRefundsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }
        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetRefundByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }
        [HttpPost("insert")]
        [HasPermission(SystemPermissions.BillingCreate)]
        public async Task<IActionResult> Create(CreateRefundCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
