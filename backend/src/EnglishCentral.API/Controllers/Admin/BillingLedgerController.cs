using EnglishCentral.Application.Features.Finance.Ledger.Queries.GetBillingLedgerEntries;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/billing/ledger")]
    [ApiController]
    public class BillingLedgerController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public BillingLedgerController(IMediator mediator) => _mediator = mediator;
        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetBillingLedgerEntriesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
