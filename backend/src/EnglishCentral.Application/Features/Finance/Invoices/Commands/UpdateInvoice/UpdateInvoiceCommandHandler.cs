using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.UpdateInvoice
{
    public class UpdateInvoiceCommandHandler : IRequestHandler<UpdateInvoiceCommand, Result<InvoiceResponse>>
    {
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly IFinanceRepository<InvoiceLine> _invoiceLineRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _paymentPlanItemRepository;

        public UpdateInvoiceCommandHandler(
            IFinanceRepository<Invoice> invoiceRepository,
            IFinanceRepository<InvoiceLine> invoiceLineRepository,
            IFinanceRepository<EnrollmentPaymentPlanItem> paymentPlanItemRepository)
        {
            _invoiceRepository = invoiceRepository;
            _invoiceLineRepository = invoiceLineRepository;
            _paymentPlanItemRepository = paymentPlanItemRepository;
        }

        public async Task<Result<InvoiceResponse>> Handle(UpdateInvoiceCommand request, CancellationToken ct)
        {
            var invoice = await _invoiceRepository.GetByIdAsync(request.Id, ct);
            if (invoice is null)
                return Result<InvoiceResponse>.Failure("Invoice is not found.", 404);
            if (invoice.Status == EInvoiceStatus.Cancelled)
                return Result<InvoiceResponse>.Failure("Cancelled invoice cannot be updated.", 400);

            var isPaid = invoice.Status == EInvoiceStatus.Paid || invoice.PaidAmount > 0;
            if (isPaid && request.DueDate.HasValue && request.DueDate.Value != invoice.DueDate)
                return Result<InvoiceResponse>.Failure("Paid invoice due date cannot be changed.", 400);

            var now = DateTimeOffset.UtcNow;
            if (request.DueDate.HasValue)
            {
                invoice.DueDate = request.DueDate.Value;
                await SyncOverdueStatusAsync(invoice, now, ct);
            }

            invoice.Notes = request.Notes?.Trim();
            invoice.UpdatedAt = now;

            var lines = await _invoiceLineRepository.ListAsync(
                q => q.Where(x => x.InvoiceId == invoice.Id),
                ct);
            invoice.Lines = lines;

            return Result<InvoiceResponse>.Success(invoice.ToResponse());
        }

        private async Task SyncOverdueStatusAsync(Invoice invoice, DateTimeOffset now, CancellationToken ct)
        {
            if (invoice.Status != EInvoiceStatus.Overdue)
                return;

            var today = GetBusinessToday();
            if (invoice.OutstandingAmount <= 0 || invoice.DueDate < today)
                return;

            invoice.Status = invoice.PaidAmount > 0
                ? EInvoiceStatus.PartiallyPaid
                : EInvoiceStatus.Issued;

            if (!invoice.PaymentPlanItemId.HasValue)
                return;

            var item = await _paymentPlanItemRepository.GetByIdAsync(invoice.PaymentPlanItemId.Value, ct);
            if (item is null || item.Status != EPaymentPlanItemStatus.Overdue)
                return;

            item.Status = EPaymentPlanItemStatus.Invoiced;
            item.UpdatedAt = now;
        }

        private static DateOnly GetBusinessToday()
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
