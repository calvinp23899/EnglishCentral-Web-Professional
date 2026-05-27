using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EnglishCentral.Infrastructure.BackgroundJobs.Billing
{
    public class OverdueDetectionJob
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<OverdueDetectionJob> _logger;

        public OverdueDetectionJob(ApplicationDbContext db, ILogger<OverdueDetectionJob> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task ExecuteAsync(CancellationToken cancellationToken = default)
        {
            var today = BillingJobClock.Today();
            var now = DateTimeOffset.UtcNow;

            var invoices = await _db.Set<Invoice>()
                .Where(x =>
                    (x.Status == InvoiceStatus.Issued || x.Status == InvoiceStatus.PartiallyPaid) &&
                    x.OutstandingAmount > 0 &&
                    x.DueDate < today)
                .ToListAsync(cancellationToken);

            if (invoices.Count == 0)
            {
                _logger.LogInformation("Overdue detection completed. No overdue invoices found.");
                return;
            }

            var itemIds = invoices
                .Where(x => x.PaymentPlanItemId.HasValue)
                .Select(x => x.PaymentPlanItemId!.Value)
                .Distinct()
                .ToList();

            var items = await _db.Set<EnrollmentPaymentPlanItem>()
                .Where(x => itemIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            foreach (var invoice in invoices)
            {
                invoice.Status = InvoiceStatus.Overdue;
                invoice.UpdatedAt = now;
            }

            foreach (var item in items)
            {
                item.Status = PaymentPlanItemStatus.Overdue;
                item.UpdatedAt = now;
            }

            await _db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Overdue detection completed. Marked {InvoiceCount} invoices overdue.", invoices.Count);
        }
    }
}
