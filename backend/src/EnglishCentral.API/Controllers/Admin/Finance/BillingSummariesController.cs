using EnglishCentral.Application.Features.Finance.Summaries.Queries.GetBillingSummary;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/summaries")]
    [ApiController]
    public class BillingSummariesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public BillingSummariesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> Get([FromQuery] GetBillingSummaryQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
