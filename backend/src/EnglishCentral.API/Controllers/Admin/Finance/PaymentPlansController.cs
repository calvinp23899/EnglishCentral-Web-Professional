using EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.CreatePaymentPlan;
using EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.DeletePaymentPlan;
using EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.SettleRemainingPaymentPlan;
using EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.UpdatePaymentPlan;
using EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlanById;
using EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlans;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/payment-plans")]
    [ApiController]
    public class PaymentPlansController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public PaymentPlansController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetPaymentPlansQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetPaymentPlanByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.BillingCreate)]
        public async Task<IActionResult> Create(CreatePaymentPlanCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> Update(long id, UpdatePaymentPlanCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id:long}/settle-remaining")]
        [HasPermission(SystemPermissions.BillingPaymentCreate)]
        public async Task<IActionResult> SettleRemaining(long id, SettleRemainingPaymentPlanCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.BillingDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeletePaymentPlanCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}

