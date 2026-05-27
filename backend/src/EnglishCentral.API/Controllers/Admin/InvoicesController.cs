using EnglishCentral.Application.Features.Finance.Invoices.Commands.CancelInvoice;
using EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoiceById;
using EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoices;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/billing/invoices")]
    [ApiController]
    public class InvoicesController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public InvoicesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetInvoicesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetInvoiceByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id:long}/cancel")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> Cancel(long id, CancelInvoiceCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
