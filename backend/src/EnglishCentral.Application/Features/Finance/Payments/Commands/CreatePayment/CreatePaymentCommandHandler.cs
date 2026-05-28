using EnglishCentral.Application.Features.Finance.Payments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Payments.Commands.CreatePayment
{
    public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Result<PaymentResponse>>
    {
        private readonly IFinanceRepository<Payment> _paymentRepository;
        private readonly IAcademicRepository<Student> _studentRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _paymentPlanItemRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _paymentPlanRepository;
        private readonly IFinanceRepository<BillingLedgerEntry> _ledgerRepository;

        public CreatePaymentCommandHandler(
            IFinanceRepository<Payment> paymentRepository,
            IAcademicRepository<Student> studentRepository,
            IFinanceRepository<Invoice> invoiceRepository,
            IAcademicRepository<Enrollment> enrollmentRepository,
            IFinanceRepository<EnrollmentPaymentPlanItem> paymentPlanItemRepository,
            IFinanceRepository<EnrollmentPaymentPlan> paymentPlanRepository,
            IFinanceRepository<BillingLedgerEntry> ledgerRepository)
        {
            _paymentRepository = paymentRepository;
            _studentRepository = studentRepository;
            _invoiceRepository = invoiceRepository;
            _enrollmentRepository = enrollmentRepository;
            _paymentPlanItemRepository = paymentPlanItemRepository;
            _paymentPlanRepository = paymentPlanRepository;
            _ledgerRepository = ledgerRepository;
        }

        public async Task<Result<PaymentResponse>> Handle(CreatePaymentCommand request, CancellationToken ct)
        {
            if (!await _studentRepository.ExistsAsync(x => x.Id == request.StudentId, ct))
                return Result<PaymentResponse>.Failure("Student is not found.", 404);

            var paymentNo = string.IsNullOrWhiteSpace(request.PaymentNo)
                ? $"PAY-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}"
                : request.PaymentNo.Trim();

            if (await _paymentRepository.ExistsAsync(x => x.PaymentNo == paymentNo, ct))
                return Result<PaymentResponse>.Failure("Payment number already exists.", 409);

            var allocationTotal = request.Allocations.Sum(x => x.Amount);
            if (allocationTotal != request.Amount)
                return Result<PaymentResponse>.Failure("Allocation total amount must equal payment amount.", 400);

            var invoiceIds = request.Allocations.Select(x => x.InvoiceId).Distinct().ToList();
            if (invoiceIds.Count != request.Allocations.Count)
                return Result<PaymentResponse>.Failure("Invoice allocation cannot be duplicated.", 400);

            var invoices = new List<Invoice>();
            foreach (var invoiceId in invoiceIds)
            {
                var invoice = await _invoiceRepository.GetByIdAsync(invoiceId, ct);
                if (invoice is null)
                    return Result<PaymentResponse>.Failure("One or more invoices are not found.", 404);
                if (invoice.Status == EInvoiceStatus.Cancelled)
                    return Result<PaymentResponse>.Failure("Cannot pay a cancelled invoice.", 400);
                if (invoice.Status == EInvoiceStatus.Paid || invoice.OutstandingAmount <= 0)
                    return Result<PaymentResponse>.Failure("Cannot pay a fully paid invoice.", 400);

                invoices.Add(invoice);
            }

            var enrollmentIds = invoices.Select(x => x.EnrollmentId).Distinct().ToList();
            var enrollments = new List<Enrollment>();
            foreach (var enrollmentId in enrollmentIds)
            {
                var enrollment = await _enrollmentRepository.GetByIdAsync(enrollmentId, ct);
                if (enrollment is null)
                    return Result<PaymentResponse>.Failure("One or more invoice enrollments are not found.", 404);

                enrollments.Add(enrollment);
            }

            if (enrollments.Any(x => x.StudentId != request.StudentId))
                return Result<PaymentResponse>.Failure("Payment student does not match invoice enrollment student.", 400);

            var paymentPlanItemIds = invoices
                .Where(x => x.PaymentPlanItemId.HasValue)
                .Select(x => x.PaymentPlanItemId!.Value)
                .Distinct()
                .ToList();

            var paymentPlanItems = new List<EnrollmentPaymentPlanItem>();
            foreach (var itemId in paymentPlanItemIds)
            {
                var item = await _paymentPlanItemRepository.GetByIdAsync(itemId, ct);
                if (item is not null)
                    paymentPlanItems.Add(item);
            }

            var now = DateTimeOffset.UtcNow;
            var payment = new Payment
            {
                StudentId = request.StudentId,
                PaymentNo = paymentNo,
                PaidAt = request.PaidAt ?? now,
                Amount = request.Amount,
                Method = request.Method,
                Status = EPaymentStatus.Completed,
                ReferenceCode = request.ReferenceCode?.Trim(),
                PayerName = request.PayerName?.Trim(),
                PayerPhone = request.PayerPhone?.Trim(),
                Notes = request.Notes?.Trim(),
                CreatedAt = now
            };

            foreach (var allocationRequest in request.Allocations)
            {
                var invoice = invoices.First(x => x.Id == allocationRequest.InvoiceId);
                if (allocationRequest.Amount > invoice.OutstandingAmount)
                    return Result<PaymentResponse>.Failure("Allocation amount cannot be greater than invoice outstanding amount.", 400);

                invoice.PaidAmount += allocationRequest.Amount;
                invoice.OutstandingAmount -= allocationRequest.Amount;
                invoice.Status = invoice.OutstandingAmount == 0
                    ? EInvoiceStatus.Paid
                    : EInvoiceStatus.PartiallyPaid;
                invoice.UpdatedAt = now;

                if (invoice.OutstandingAmount == 0 && invoice.PaymentPlanItemId.HasValue)
                {
                    var item = paymentPlanItems.FirstOrDefault(x => x.Id == invoice.PaymentPlanItemId.Value);
                    if (item is not null)
                    {
                        item.Status = EPaymentPlanItemStatus.Paid;
                        item.UpdatedAt = now;
                    }
                }

                var enrollment = enrollments.First(x => x.Id == invoice.EnrollmentId);
                enrollment.PaidAmount += allocationRequest.Amount;
                enrollment.OutstandingAmount -= allocationRequest.Amount;
                enrollment.UpdatedAt = now;

                payment.Allocations.Add(new PaymentAllocation
                {
                    Payment = payment,
                    InvoiceId = invoice.Id,
                    Amount = allocationRequest.Amount,
                    AllocatedAt = now,
                    CreatedAt = now
                });

                await _ledgerRepository.AddAsync(new BillingLedgerEntry
                {
                    EnrollmentId = invoice.EnrollmentId,
                    InvoiceId = invoice.Id,
                    Payment = payment,
                    Type = EBillingLedgerEntryType.PaymentAllocated,
                    CreditAmount = allocationRequest.Amount,
                    BalanceAfter = invoice.OutstandingAmount,
                    OccurredAt = now,
                    Description = "Payment allocated to invoice"
                }, ct);
            }

            payment.Receipt = new Receipt
            {
                Payment = payment,
                ReceiptNo = $"RCT-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}",
                IssuedAt = now,
                Amount = request.Amount,
                Notes = request.Notes?.Trim(),
                CreatedAt = now
            };

            await UpdateCompletedPaymentPlansAsync(paymentPlanItems, now, ct);

            await _paymentRepository.AddAsync(payment, ct);
            return Result<PaymentResponse>.Success(payment.ToResponse(), 201);
        }

        private async Task UpdateCompletedPaymentPlansAsync(
            List<EnrollmentPaymentPlanItem> touchedItems,
            DateTimeOffset now,
            CancellationToken ct)
        {
            var planIds = touchedItems
                .Select(x => x.PaymentPlanId)
                .Distinct()
                .ToList();

            foreach (var planId in planIds)
            {
                var plan = await _paymentPlanRepository.GetByIdAsync(planId, ct);
                if (plan is null || plan.Status == EPaymentPlanStatus.Completed)
                    continue;

                var planItems = await _paymentPlanItemRepository.ListAsync(q => q.Where(x => x.PaymentPlanId == planId), ct);
                var touchedById = touchedItems.ToDictionary(x => x.Id);
                foreach (var planItem in planItems)
                {
                    if (touchedById.TryGetValue(planItem.Id, out var touchedItem))
                        planItem.Status = touchedItem.Status;
                }

                if (planItems.Count > 0 && planItems.All(x => x.Status == EPaymentPlanItemStatus.Paid))
                {
                    plan.Status = EPaymentPlanStatus.Completed;
                    plan.UpdatedAt = now;
                }
            }
        }
    }
}
