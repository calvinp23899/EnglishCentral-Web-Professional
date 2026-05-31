using EnglishCentral.Application.Features.Finance.Discounts.Commands.CreateDiscount;
using EnglishCentral.Application.Features.Finance.Discounts.Commands.DeleteDiscount;
using EnglishCentral.Application.Features.Finance.Discounts.Commands.UpdateDiscount;
using EnglishCentral.Application.Features.Finance.Discounts.Queries.GetDiscountById;
using EnglishCentral.Application.Features.Finance.Discounts.Queries.GetDiscounts;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/discounts")]
    [ApiController]
    public class DiscountsController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public DiscountsController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetDiscountsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetDiscountByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.BillingCreate)]
        public async Task<IActionResult> Create(CreateDiscountCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> Update(long id, UpdateDiscountCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.BillingDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteDiscountCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
