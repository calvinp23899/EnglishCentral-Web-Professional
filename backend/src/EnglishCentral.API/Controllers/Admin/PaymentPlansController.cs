using EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlanById;
using EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlans;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
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
    }
}

