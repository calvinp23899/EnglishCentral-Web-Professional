using EnglishCentral.Application.Features.Finance.Invoices.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Invoices.Commands.CreateInvoiceFromPaymentPlanItem
{
    public class CreateInvoiceFromPaymentPlanItemCommandHandler
        : IRequestHandler<CreateInvoiceFromPaymentPlanItemCommand, Result<InvoiceResponse>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _paymentPlanItemRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _paymentPlanRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;

        public CreateInvoiceFromPaymentPlanItemCommandHandler(
            IFinanceRepository<EnrollmentPaymentPlanItem> paymentPlanItemRepository,
            IFinanceRepository<EnrollmentPaymentPlan> paymentPlanRepository,
            IFinanceRepository<Invoice> invoiceRepository)
        {
            _paymentPlanItemRepository = paymentPlanItemRepository;
            _paymentPlanRepository = paymentPlanRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<Result<InvoiceResponse>> Handle(CreateInvoiceFromPaymentPlanItemCommand request, CancellationToken ct)
        {
            var item = await _paymentPlanItemRepository.FirstOrDefaultAsync(
                x => x.Id == request.PaymentPlanItemId,
                ct,
                asNoTracking: false);
            if (item is null)
                return Result<InvoiceResponse>.Failure("Payment plan item is not found.", 404);

            if (item.Status == EPaymentPlanItemStatus.Paid)
                return Result<InvoiceResponse>.Failure("Paid payment plan item already has completed payment.", 400);
            if (item.Status == EPaymentPlanItemStatus.Cancelled)
                return Result<InvoiceResponse>.Failure("Cancelled payment plan item cannot be invoiced.", 400);

            var existingInvoice = await _invoiceRepository.FirstOrDefaultAsync(
                x => x.PaymentPlanItemId == item.Id,
                ct,
                asNoTracking: false);
            if (existingInvoice is not null)
                return Result<InvoiceResponse>.Success(existingInvoice.ToResponse());

            var plan = await _paymentPlanRepository.GetByIdAsync(item.PaymentPlanId, ct);
            if (plan is null)
                return Result<InvoiceResponse>.Failure("Payment plan is not found.", 404);

            var now = DateTimeOffset.UtcNow;
            var invoice = new Invoice
            {
                EnrollmentId = plan.EnrollmentId,
                PaymentPlanItemId = item.Id,
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
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? item.Name : request.Notes.Trim(),
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

            await _invoiceRepository.AddAsync(invoice, ct);
            return Result<InvoiceResponse>.Success(invoice.ToResponse(), 201);
        }
    }
}
