using EnglishCentral.Application.Features.Finance.Invoices.Commands.BulkCreateInvoicesFromPaymentPlanItems;
using EnglishCentral.Application.Features.Finance.Invoices.Commands.CancelInvoice;
using EnglishCentral.Application.Features.Finance.Invoices.Commands.CreateInvoiceFromPaymentPlanItem;
using EnglishCentral.Application.Features.Finance.Invoices.Commands.UpdateInvoice;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoiceById;
using EnglishCentral.Application.Features.Finance.Invoices.Queries.GetInvoices;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/invoices")]
    [ApiController]
    public class InvoicesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        private readonly IBillingPdfService _billingPdfService;

        public InvoicesController(IMediator mediator, IBillingPdfService billingPdfService)
        {
            _mediator = mediator;
            _billingPdfService = billingPdfService;
        }

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

        [HttpGet("{id:long}/download-pdf")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> DownloadPdf(long id, CancellationToken ct)
        {
            var result = await _billingPdfService.GenerateInvoicePdfAsync(id, ct);
            if (!result.IsSuccess || result.Data is null)
                return StatusCode(result.StatusCode, result);

            return File(result.Data.Content, result.Data.ContentType, result.Data.FileName);
        }

        [HttpPost("{id:long}/cancel")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public IActionResult Cancel(long id, CancelInvoiceCommand command, CancellationToken ct)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invoice cancellation is not allowed. Use refund or credit note adjustment instead."
            });
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> Update(long id, UpdateInvoiceCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("create-from-payment-plan-item")]
        [HasPermission(SystemPermissions.BillingCreate)]
        public async Task<IActionResult> CreateFromPaymentPlanItem(CreateInvoiceFromPaymentPlanItemCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("bulk-create-from-payment-plan-items")]
        [HasPermission(SystemPermissions.BillingCreate)]
        public async Task<IActionResult> BulkCreateFromPaymentPlanItems(BulkCreateInvoicesFromPaymentPlanItemsCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
