using EnglishCentral.Application.Interfaces.Documents;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Results;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Services.Pdf
{
    public class BillingPdfService : IBillingPdfService
    {
        private readonly ApplicationDbContext _db;
        private readonly IPdfGenerator _pdfGenerator;

        public BillingPdfService(ApplicationDbContext db, IPdfGenerator pdfGenerator)
        {
            _db = db;
            _pdfGenerator = pdfGenerator;
        }

        public async Task<Result<GeneratedPdf>> GenerateInvoicePdfAsync(long invoiceId, CancellationToken ct = default)
        {
            var invoice = await _db.Invoices
                .AsNoTracking()
                .Include(x => x.Lines)
                .Include(x => x.Enrollment)
                    .ThenInclude(x => x.Student)
                .Include(x => x.Enrollment)
                    .ThenInclude(x => x.Class)
                .FirstOrDefaultAsync(x => x.Id == invoiceId, ct);

            if (invoice is null)
                return Result<GeneratedPdf>.Failure("Invoice is not found.", 404);

            var lines = invoice.Lines.Count > 0
                ? invoice.Lines
                    .OrderBy(x => x.Id)
                    .Select(x => new InvoicePdfLine(x.Quantity, x.Description, x.UnitPrice, x.LineTotal))
                    .ToList()
                : [new InvoicePdfLine(1, invoice.Notes ?? invoice.InvoiceNo, invoice.TotalAmount, invoice.TotalAmount)];

            var model = new InvoicePdfModel(
                DefaultCompany(),
                new BilledToPdfInfo(
                    invoice.Enrollment.Student.FullName,
                    invoice.Enrollment.Student.StudentCode,
                    invoice.Enrollment.Student.Email),
                invoice.InvoiceNo,
                DateOnly.FromDateTime(invoice.IssuedAt.DateTime),
                invoice.DueDate,
                invoice.Status,
                invoice.OutstandingAmount,
                invoice.SubtotalAmount,
                invoice.TaxAmount,
                invoice.DiscountAmount,
                invoice.TotalAmount,
                invoice.PaidAmount,
                invoice.OutstandingAmount,
                lines);

            var pdf = _pdfGenerator.Generate(new PdfGenerationRequest(
                PdfTemplate.Invoice,
                model,
                $"{invoice.InvoiceNo}.pdf"));

            return Result<GeneratedPdf>.Success(pdf);
        }

        public async Task<Result<GeneratedPdf>> GeneratePaymentPlanStatementPdfAsync(long paymentPlanId, CancellationToken ct = default)
        {
            var plan = await _db.EnrollmentPaymentPlans
                .AsNoTracking()
                .Include(x => x.Enrollment)
                    .ThenInclude(x => x.Student)
                .Include(x => x.Enrollment)
                    .ThenInclude(x => x.Class)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == paymentPlanId, ct);

            if (plan is null)
                return Result<GeneratedPdf>.Failure("Payment plan is not found.", 404);
            if (plan.Items.Count == 0)
                return Result<GeneratedPdf>.Failure("Payment plan has no items.", 400);

            var itemIds = plan.Items.Select(x => x.Id).ToList();
            var invoices = await _db.Invoices
                .AsNoTracking()
                .Where(x => x.PaymentPlanItemId.HasValue && itemIds.Contains(x.PaymentPlanItemId.Value))
                .ToListAsync(ct);
            var invoicesByItemId = invoices
                .Where(x => x.PaymentPlanItemId.HasValue)
                .ToDictionary(x => x.PaymentPlanItemId!.Value);

            var items = plan.Items
                .OrderBy(x => x.SequenceNumber)
                .Select(item =>
                {
                    invoicesByItemId.TryGetValue(item.Id, out var invoice);
                    return new PaymentPlanStatementItemPdfModel(
                        item.SequenceNumber,
                        item.Name,
                        item.DueDate,
                        item.Amount,
                        invoice?.InvoiceNo ?? "Not created",
                        invoice?.PaidAmount ?? 0,
                        invoice?.OutstandingAmount ?? item.Amount,
                        invoice?.Status.ToString() ?? item.Status.ToString());
                })
                .ToList();

            var paidAmount = invoices.Sum(x => x.PaidAmount);
            var outstandingAmount = items.Sum(x => x.Outstanding);
            var statementNumber = $"STM-PP-{plan.Id}";
            var model = new PaymentPlanStatementPdfModel(
                DefaultCompany(),
                new BilledToPdfInfo(
                    plan.Enrollment.Student.FullName,
                    plan.Enrollment.Student.StudentCode,
                    plan.Enrollment.Student.Email),
                statementNumber,
                Today(),
                plan.Enrollment.Class.Name,
                ToPlanTypeLabel(plan.Type, plan.NumberOfInstallments),
                plan.TotalAmount,
                paidAmount,
                outstandingAmount,
                items);

            var pdf = _pdfGenerator.Generate(new PdfGenerationRequest(
                PdfTemplate.PaymentPlanStatement,
                model,
                $"{statementNumber}.pdf"));

            return Result<GeneratedPdf>.Success(pdf);
        }

        private static CompanyPdfInfo DefaultCompany()
        {
            return new CompanyPdfInfo(
                "English Central",
                "123 Awesome Street, Denver CO",
                "billing@englishcentral.com");
        }

        private static string ToPlanTypeLabel(EPaymentPlanType type, int? installments)
        {
            return type switch
            {
                EPaymentPlanType.Monthly => installments.HasValue ? $"Monthly {installments.Value} installments" : "Monthly",
                EPaymentPlanType.Installment => installments.HasValue ? $"Installment {installments.Value} installments" : "Installment",
                _ => "Full payment"
            };
        }

        private static DateOnly Today()
        {
            try
            {
                var timeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                return DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, timeZone).DateTime);
            }
            catch (TimeZoneNotFoundException)
            {
                var timeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");
                return DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, timeZone).DateTime);
            }
        }
    }
}
