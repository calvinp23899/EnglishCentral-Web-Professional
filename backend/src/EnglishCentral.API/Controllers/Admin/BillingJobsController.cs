using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Infrastructure.BackgroundJobs.Billing;
using EnglishCentral.Shared.Constants;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/billing/jobs")]
    [ApiController]
    public class BillingJobsController : AdminBaseController
    {
        [HttpPost("generate-invoices")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> GenerateInvoices([FromServices] AutoGenerateInvoiceJob job, CancellationToken ct)
        {
            await job.ExecuteAsync(ct);
            return Ok(new { success = true });
        }

        [HttpPost("detect-overdue")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> DetectOverdue([FromServices] OverdueDetectionJob job, CancellationToken ct)
        {
            await job.ExecuteAsync(ct);
            return Ok(new { success = true });
        }
    }
}
