using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Payments.Commands.CancelPayment
{
    public class CancelPaymentCommandHandler : IRequestHandler<CancelPaymentCommand, Result<bool>>
    {
        private readonly IFinanceRepository<Payment> _paymentRepository;
        private readonly IFinanceRepository<PaymentAllocation> _allocationRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IFinanceRepository<BillingLedgerEntry> _ledgerRepository;

        public CancelPaymentCommandHandler(IFinanceRepository<Payment> paymentRepository, IFinanceRepository<PaymentAllocation> allocationRepository, IFinanceRepository<Invoice> invoiceRepository, IAcademicRepository<Enrollment> enrollmentRepository, IFinanceRepository<BillingLedgerEntry> ledgerRepository)
        {
            _paymentRepository = paymentRepository;
            _allocationRepository = allocationRepository;
            _invoiceRepository = invoiceRepository;
            _enrollmentRepository = enrollmentRepository;
            _ledgerRepository = ledgerRepository;
        }

        public async Task<Result<bool>> Handle(CancelPaymentCommand request, CancellationToken ct)
        {
            var payment = await _paymentRepository.GetByIdAsync(request.Id, ct);
            if (payment is null)
                return Result<bool>.Failure("Payment is not found.", 404);
            if (payment.Status != EPaymentStatus.Completed)
                return Result<bool>.Failure("Only completed payment can be cancelled.", 400);

            var allocations = await _allocationRepository.ListAsync(q => q.Where(x => x.PaymentId == payment.Id), ct);
            foreach (var allocation in allocations)
            {
                var invoice = await _invoiceRepository.GetByIdAsync(allocation.InvoiceId, ct);
                if (invoice is null) continue;
                invoice.PaidAmount -= allocation.Amount;
                invoice.OutstandingAmount += allocation.Amount;
                invoice.Status = invoice.PaidAmount == 0 ? EInvoiceStatus.Issued : EInvoiceStatus.PartiallyPaid;
                invoice.UpdatedAt = DateTimeOffset.UtcNow;

                var enrollment = await _enrollmentRepository.GetByIdAsync(invoice.EnrollmentId, ct);
                if (enrollment is not null)
                {
                    enrollment.PaidAmount -= allocation.Amount;
                    enrollment.OutstandingAmount += allocation.Amount;
                    enrollment.UpdatedAt = DateTimeOffset.UtcNow;
                }

                await _ledgerRepository.AddAsync(new BillingLedgerEntry
                {
                    EnrollmentId = invoice.EnrollmentId,
                    InvoiceId = invoice.Id,
                    PaymentId = payment.Id,
                    PaymentAllocationId = allocation.Id,
                    Type = EBillingLedgerEntryType.PaymentCancelled,
                    DebitAmount = allocation.Amount,
                    BalanceAfter = invoice.OutstandingAmount,
                    OccurredAt = DateTimeOffset.UtcNow,
                    Description = request.Reason?.Trim()
                }, ct);
            }

            payment.Status = EPaymentStatus.Cancelled;
            payment.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
