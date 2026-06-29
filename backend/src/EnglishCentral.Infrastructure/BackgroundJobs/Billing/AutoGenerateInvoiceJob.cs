using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EnglishCentral.Infrastructure.BackgroundJobs.Billing
{
    public class AutoGenerateInvoiceJob
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AutoGenerateInvoiceJob> _logger;

        public AutoGenerateInvoiceJob(ApplicationDbContext db, ILogger<AutoGenerateInvoiceJob> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task ExecuteAsync(CancellationToken cancellationToken = default)
        {
            var today = BillingJobClock.Today();
            var generateUntil = today.AddDays(7);
            var now = DateTimeOffset.UtcNow;

            var items = await _db.Set<EnrollmentPaymentPlanItem>()
                .Include(x => x.PaymentPlan)
                .Where(x =>
                    x.Status == EPaymentPlanItemStatus.Pending &&
                    x.DueDate <= generateUntil)
                .OrderBy(x => x.DueDate)
                .ThenBy(x => x.SequenceNumber)
                .ToListAsync(cancellationToken);

            if (items.Count == 0)
            {
                _logger.LogInformation("Auto generate invoice completed. No pending payment plan items found.");
                return;
            }

            foreach (var item in items)
            {
                var invoice = new Invoice
                {
                    EnrollmentId = item.PaymentPlan.EnrollmentId,
                    PaymentPlanItem = item,
                    InvoiceNo = $"INV-{now:yyyyMMddHHmmssfff}-{item.Id}",
                    IssuedAt = now,
                    DueDate = item.DueDate,
                    SubtotalAmount = item.Amount,
                    DiscountAmount = 0,
                    TaxAmount = 0,
                    TotalAmount = item.Amount,
                    PaidAmount = 0,
                    OutstandingAmount = item.Amount,
                    Status = EInvoiceStatus.Issued,
                    Notes = item.Name,
                    CreatedAt = now
                };

                invoice.Lines.Add(new InvoiceLine
                {
                    Invoice = invoice,
                    ItemType = EBillingItemType.Tuition,
                    Description = item.Name,
                    Quantity = 1,
                    UnitPrice = item.Amount,
                    DiscountAmount = 0,
                    LineTotal = item.Amount,
                    CreatedAt = now
                });

                item.Status = EPaymentPlanItemStatus.Invoiced;
                item.UpdatedAt = now;
                _db.Set<Invoice>().Add(invoice);
            }

            await _db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Auto generate invoice completed. Generated {InvoiceCount} invoices.", items.Count);
        }
    }
}
