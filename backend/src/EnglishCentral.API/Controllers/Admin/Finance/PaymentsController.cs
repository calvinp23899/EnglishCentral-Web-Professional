using EnglishCentral.Application.Features.Finance.Payments.Commands.CancelPayment;
using EnglishCentral.Application.Features.Finance.Payments.Commands.CreatePayment;
using EnglishCentral.Application.Interfaces.Finance;
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
        private readonly IPaymentPdfService _paymentPdfService;

        public PaymentsController(IMediator mediator, IPaymentPdfService paymentPdfService)
        {
            _mediator = mediator;
            _paymentPdfService = paymentPdfService;
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.BillingPaymentCreate)]
        public async Task<IActionResult> Create(CreatePaymentCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            if (!result.IsSuccess || result.Data is null)
                return StatusCode(result.StatusCode, result);

            var pdfResult = await _paymentPdfService.GeneratePaymentInvoicePdfAsync(result.Data.Id, ct);
            if (!pdfResult.IsSuccess || pdfResult.Data is null)
                return StatusCode(pdfResult.StatusCode, pdfResult);

            return File(pdfResult.Data.Content, pdfResult.Data.ContentType, pdfResult.Data.FileName);
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
