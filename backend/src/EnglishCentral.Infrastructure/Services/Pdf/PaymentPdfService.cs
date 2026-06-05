using EnglishCentral.Application.Interfaces.Documents;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Results;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Services.Pdf
{
    public class PaymentPdfService : IPaymentPdfService
    {
        private readonly ApplicationDbContext _db;
        private readonly IPdfGenerator _pdfGenerator;

        public PaymentPdfService(ApplicationDbContext db, IPdfGenerator pdfGenerator)
        {
            _db = db;
            _pdfGenerator = pdfGenerator;
        }

        public async Task<Result<GeneratedPdf>> GeneratePaymentInvoicePdfAsync(long paymentId, CancellationToken ct = default)
        {
            var payment = await _db.Payments
                .AsNoTracking()
                .Include(x => x.Student)
                .Include(x => x.Allocations)
                    .ThenInclude(x => x.Invoice)
                        .ThenInclude(x => x.Lines)
                .Include(x => x.Allocations)
                    .ThenInclude(x => x.Invoice)
                        .ThenInclude(x => x.Enrollment)
                            .ThenInclude(x => x.Class)
                .FirstOrDefaultAsync(x => x.Id == paymentId, ct);

            if (payment is null)
                return Result<GeneratedPdf>.Failure("Payment is not found.", 404);
            if (payment.Allocations.Count == 0)
                return Result<GeneratedPdf>.Failure("Payment has no invoice allocations.", 400);

            var orderedAllocations = payment.Allocations
                .OrderBy(x => x.Invoice.DueDate)
                .ThenBy(x => x.Invoice.InvoiceNo)
                .ToList();

            var firstInvoice = orderedAllocations.First().Invoice;
            var className = firstInvoice.Enrollment.Class.Name;
            var invoiceNumber = orderedAllocations.Count == 1
                ? firstInvoice.InvoiceNo
                : payment.PaymentNo;

            var lines = orderedAllocations
                .Select(allocation =>
                {
                    var invoice = allocation.Invoice;
                    var invoiceLine = invoice.Lines.FirstOrDefault();
                    var description = orderedAllocations.Count == 1
                        ? $"{invoiceLine?.Description ?? invoice.Notes ?? invoice.InvoiceNo} - Hoc phi lop"
                        : $"{invoice.InvoiceNo} - {invoice.Notes ?? invoiceLine?.Description ?? className}";

                    return new PaymentInvoicePdfLine(
                        1,
                        description,
                        allocation.Amount,
                        allocation.Amount);
                })
                .ToList();

            var subtotal = lines.Sum(x => x.Amount);
            var model = new PaymentInvoicePdfModel(
                new CompanyPdfInfo(
                    "English Central",
                    "123 Awesome Street, Denver CO",
                    "billing@englishcentral.com"),
                new BilledToPdfInfo(
                    payment.Student.FullName,
                    payment.Student.StudentCode,
                    payment.Student.Email),
                invoiceNumber,
                DateOnly.FromDateTime(payment.PaidAt.DateTime),
                "Amount Paid:",
                payment.Amount,
                subtotal,
                0,
                0,
                subtotal,
                lines);

            var pdf = _pdfGenerator.Generate(new PdfGenerationRequest(
                PdfTemplate.PaymentInvoice,
                model,
                $"{invoiceNumber}.pdf"));

            return Result<GeneratedPdf>.Success(pdf);
        }
    }
}
