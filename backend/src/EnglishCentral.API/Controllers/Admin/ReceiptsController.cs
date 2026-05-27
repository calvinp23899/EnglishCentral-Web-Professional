using EnglishCentral.Application.Features.Finance.Receipts.Queries.GetReceiptById;
using EnglishCentral.Application.Features.Finance.Receipts.Queries.GetReceipts;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/billing/receipts")]
    [ApiController]
    public class ReceiptsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ReceiptsController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetReceiptsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetReceiptByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}

