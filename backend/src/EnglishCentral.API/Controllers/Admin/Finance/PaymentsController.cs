using EnglishCentral.Application.Features.Finance.Payments.Commands.CancelPayment;
using EnglishCentral.Application.Features.Finance.Payments.Commands.CreatePayment;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/payments")]
    [ApiController]
    public class PaymentsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public PaymentsController(IMediator mediator) => _mediator = mediator;

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.BillingPaymentCreate)]
        public async Task<IActionResult> Create(CreatePaymentCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id:long}/cancel")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> Cancel(long id, CancelPaymentCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
