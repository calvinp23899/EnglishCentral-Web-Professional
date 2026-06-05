using EnglishCentral.Application.Features.Finance.Payments.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.SettleRemainingPaymentPlan
{
    public class SettleRemainingPaymentPlanCommandHandler
        : IRequestHandler<SettleRemainingPaymentPlanCommand, Result<PaymentResponse>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _paymentPlanRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _paymentPlanItemRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly IFinanceRepository<Payment> _paymentRepository;
        private readonly IFinanceRepository<BillingLedgerEntry> _ledgerRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SettleRemainingPaymentPlanCommandHandler(
            IFinanceRepository<EnrollmentPaymentPlan> paymentPlanRepository,
            IFinanceRepository<EnrollmentPaymentPlanItem> paymentPlanItemRepository,
            IFinanceRepository<Invoice> invoiceRepository,
            IFinanceRepository<Payment> paymentRepository,
            IFinanceRepository<BillingLedgerEntry> ledgerRepository,
            IAcademicRepository<Enrollment> enrollmentRepository,
            IUnitOfWork unitOfWork)
        {
            _paymentPlanRepository = paymentPlanRepository;
            _paymentPlanItemRepository = paymentPlanItemRepository;
            _invoiceRepository = invoiceRepository;
            _paymentRepository = paymentRepository;
            _ledgerRepository = ledgerRepository;
            _enrollmentRepository = enrollmentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PaymentResponse>> Handle(SettleRemainingPaymentPlanCommand request, CancellationToken ct)
        {
            var plan = await _paymentPlanRepository.GetByIdAsync(request.Id, ct);
            if (plan is null)
                return Result<PaymentResponse>.Failure("Payment plan is not found.", 404);
            if (plan.Status == EPaymentPlanStatus.Cancelled)
                return Result<PaymentResponse>.Failure("Cancelled payment plan cannot be settled.", 400);
            if (plan.Status == EPaymentPlanStatus.Completed)
                return Result<PaymentResponse>.Failure("Payment plan is already completed.", 400);

            var enrollment = await _enrollmentRepository.GetByIdAsync(plan.EnrollmentId, ct);
            if (enrollment is null)
                return Result<PaymentResponse>.Failure("Enrollment is not found.", 404);
            if (enrollment.Status == EEnrollmentStatus.Dropped)
                return Result<PaymentResponse>.Failure("Cancelled enrollment cannot be settled.", 400);

            var items = await _paymentPlanItemRepository.ListAsync(
                q => q.Where(x => x.PaymentPlanId == plan.Id),
                ct,
                asNoTracking: false);
            if (items.Count == 0)
                return Result<PaymentResponse>.Failure("Payment plan has no items.", 400);

            var fromSequence = 0;
            if (request.FromPaymentPlanItemId.HasValue)
            {
                var fromItem = items.FirstOrDefault(x => x.Id == request.FromPaymentPlanItemId.Value);
                if (fromItem is null)
                    return Result<PaymentResponse>.Failure("Payment plan item does not belong to this payment plan.", 400);

                fromSequence = fromItem.SequenceNumber;
            }

            var payableItems = items
                .Where(x =>
                    x.SequenceNumber >= fromSequence &&
                    x.Status != EPaymentPlanItemStatus.Paid &&
                    x.Status != EPaymentPlanItemStatus.Cancelled)
                .OrderBy(x => x.SequenceNumber)
                .ToList();
            if (payableItems.Count == 0)
                return Result<PaymentResponse>.Failure("No remaining payment plan items to settle.", 400);

            var itemIds = payableItems.Select(x => x.Id).ToList();
            var invoices = await _invoiceRepository.ListAsync(
                q => q.Where(x => x.PaymentPlanItemId.HasValue && itemIds.Contains(x.PaymentPlanItemId.Value)),
                ct,
                asNoTracking: false);
            if (invoices.Any(x => x.Status == EInvoiceStatus.Cancelled))
                return Result<PaymentResponse>.Failure("Cannot settle remaining payment because one or more invoices are cancelled.", 400);

            var now = DateTimeOffset.UtcNow;
            foreach (var item in payableItems)
            {
                if (invoices.Any(x => x.PaymentPlanItemId == item.Id))
                    continue;

                var invoice = CreateInvoice(enrollment.Id, item, now);
                invoices.Add(invoice);
                await _invoiceRepository.AddAsync(invoice, ct);

                item.Status = EPaymentPlanItemStatus.Invoiced;
                item.UpdatedAt = now;
            }

            var payableInvoices = invoices
                .Where(x => x.OutstandingAmount > 0 && x.Status != EInvoiceStatus.Paid)
                .OrderBy(x => payableItems.First(i => i.Id == x.PaymentPlanItemId).SequenceNumber)
                .ToList();
            if (payableInvoices.Count == 0)
                return Result<PaymentResponse>.Failure("No outstanding invoices to settle.", 400);

            var amount = payableInvoices.Sum(x => x.OutstandingAmount);
            var paymentNo = $"PAY-{now:yyyyMMddHHmmssfff}";
            if (await _paymentRepository.ExistsAsync(x => x.PaymentNo == paymentNo, ct))
                return Result<PaymentResponse>.Failure("Payment number already exists.", 409);

            var payment = new Payment
            {
                StudentId = enrollment.StudentId,
                PaymentNo = paymentNo,
                PaidAt = request.PaidAt ?? now,
                Amount = amount,
                Method = request.Method,
                Status = EPaymentStatus.Completed,
                ReferenceCode = request.ReferenceCode?.Trim(),
                PayerName = request.PayerName?.Trim(),
                PayerPhone = request.PayerPhone?.Trim(),
                Notes = request.Notes?.Trim(),
                CreatedAt = now
            };

            foreach (var invoice in payableInvoices)
            {
                var allocationAmount = invoice.OutstandingAmount;
                invoice.PaidAmount += allocationAmount;
                invoice.OutstandingAmount = 0;
                invoice.Status = EInvoiceStatus.Paid;
                invoice.UpdatedAt = now;

                var item = payableItems.First(x => x.Id == invoice.PaymentPlanItemId);
                item.Status = EPaymentPlanItemStatus.Paid;
                item.UpdatedAt = now;

                enrollment.PaidAmount += allocationAmount;
                enrollment.OutstandingAmount -= allocationAmount;
                enrollment.UpdatedAt = now;

                payment.Allocations.Add(new PaymentAllocation
                {
                    Payment = payment,
                    Invoice = invoice,
                    InvoiceId = invoice.Id,
                    Amount = allocationAmount,
                    AllocatedAt = now,
                    CreatedAt = now
                });

                await _ledgerRepository.AddAsync(new BillingLedgerEntry
                {
                    EnrollmentId = enrollment.Id,
                    Invoice = invoice,
                    Payment = payment,
                    Type = EBillingLedgerEntryType.PaymentAllocated,
                    CreditAmount = allocationAmount,
                    BalanceAfter = invoice.OutstandingAmount,
                    OccurredAt = now,
                    Description = "Remaining payment plan settled"
                }, ct);
            }

            if (items.All(x => x.Status == EPaymentPlanItemStatus.Paid))
            {
                plan.Status = EPaymentPlanStatus.Completed;
                plan.UpdatedAt = now;
            }

            payment.Receipt = new Receipt
            {
                Payment = payment,
                ReceiptNo = $"RCT-{now:yyyyMMddHHmmssfff}",
                IssuedAt = now,
                Amount = amount,
                Notes = request.Notes?.Trim(),
                CreatedAt = now
            };

            await _paymentRepository.AddAsync(payment, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            return Result<PaymentResponse>.Success(payment.ToResponse(), 201);
        }

        private static Invoice CreateInvoice(long enrollmentId, EnrollmentPaymentPlanItem item, DateTimeOffset now)
        {
            var invoice = new Invoice
            {
                EnrollmentId = enrollmentId,
                PaymentPlanItem = item,
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

            return invoice;
        }
    }
}
