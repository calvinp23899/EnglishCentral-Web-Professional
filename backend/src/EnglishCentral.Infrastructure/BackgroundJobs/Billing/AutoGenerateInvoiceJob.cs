using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
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
                var enrollment = await _db.Enrollments
                    .Include(x => x.Discounts)
                    .FirstAsync(x => x.Id == item.PaymentPlan.EnrollmentId, cancellationToken);

                var planTotal = item.PaymentPlan.TotalAmount;
                var enrollmentDiscountTotal = enrollment.Discounts.Sum(x => x.Amount);
                var discountAmount = planTotal > 0 && enrollmentDiscountTotal > 0
                    ? Math.Round(enrollmentDiscountTotal * item.Amount / planTotal, 2)
                    : 0;
                if (discountAmount > item.Amount)
                    discountAmount = item.Amount;

                var invoiceTotal = item.Amount - discountAmount;
                var invoice = new Invoice
                {
                    EnrollmentId = item.PaymentPlan.EnrollmentId,
                    PaymentPlanItem = item,
                    InvoiceNo = $"INV-{now:yyyyMMddHHmmssfff}-{item.Id}",
                    IssuedAt = now,
                    DueDate = item.DueDate,
                    SubtotalAmount = item.Amount,
                    DiscountAmount = discountAmount,
                    TaxAmount = 0,
                    TotalAmount = invoiceTotal,
                    PaidAmount = 0,
                    OutstandingAmount = invoiceTotal,
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
                    DiscountAmount = discountAmount,
                    LineTotal = item.Amount,
                    CreatedAt = now
                });

                if (discountAmount > 0)
                {
                    invoice.Lines.Add(new InvoiceLine
                    {
                        Invoice = invoice,
                        ItemType = EBillingItemType.Discount,
                        Description = "Allocated enrollment discount",
                        Quantity = 1,
                        UnitPrice = -discountAmount,
                        DiscountAmount = 0,
                        LineTotal = -discountAmount,
                        CreatedAt = now
                    });

                    invoice.Discounts.Add(new InvoiceDiscount
                    {
                        Invoice = invoice,
                        Name = "Allocated enrollment discount",
                        Type = EDiscountType.FixedAmount,
                        Value = discountAmount,
                        Amount = discountAmount,
                        Reason = "Auto allocated from enrollment discounts",
                        CreatedAt = now
                    });
                }

                item.Status = EPaymentPlanItemStatus.Invoiced;
                item.UpdatedAt = now;
                _db.Set<Invoice>().Add(invoice);
            }

            await _db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Auto generate invoice completed. Generated {InvoiceCount} invoices.", items.Count);
        }
    }
}
