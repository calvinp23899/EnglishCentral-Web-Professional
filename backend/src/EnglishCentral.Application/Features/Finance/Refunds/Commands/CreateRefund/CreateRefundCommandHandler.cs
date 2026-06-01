using EnglishCentral.Application.Features.Finance.Refunds.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Refunds.Commands.CreateRefund
{
    public class CreateRefundCommandHandler : IRequestHandler<CreateRefundCommand, Result<RefundResponse>>
    {
        private readonly IFinanceRepository<Refund> _refundRepository;
        private readonly IFinanceRepository<Payment> _paymentRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IFinanceRepository<BillingLedgerEntry> _ledgerRepository;
        private readonly IFinanceRepository<PaymentAllocation> _allocationRepository;
        public CreateRefundCommandHandler(IFinanceRepository<Refund> refundRepository, IFinanceRepository<Payment> paymentRepository, IAcademicRepository<Enrollment> enrollmentRepository, IFinanceRepository<BillingLedgerEntry> ledgerRepository, IFinanceRepository<PaymentAllocation> allocationRepository)
        {
            _refundRepository = refundRepository; _paymentRepository = paymentRepository; _enrollmentRepository = enrollmentRepository; _ledgerRepository = ledgerRepository; _allocationRepository = allocationRepository;
        }
        public async Task<Result<RefundResponse>> Handle(CreateRefundCommand request, CancellationToken ct)
        {
            var payment = await _paymentRepository.GetByIdAsync(request.PaymentId, ct);
            if (payment is null) return Result<RefundResponse>.Failure("Payment is not found.", 404);
            if (payment.Status != EPaymentStatus.Completed) return Result<RefundResponse>.Failure("Only completed payment can be refunded.", 400);
            var existingRefunds = await _refundRepository.ListAsync(q => q.Where(x => x.PaymentId == payment.Id && x.Status == ERefundStatus.Completed), ct);
            if (existingRefunds.Sum(x => x.Amount) + request.Amount > payment.Amount)
                return Result<RefundResponse>.Failure("Refund amount exceeds refundable payment amount.", 400);
            Enrollment? enrollment = null;
            if (request.EnrollmentId.HasValue)
            {
                enrollment = await _enrollmentRepository.GetByIdAsync(request.EnrollmentId.Value, ct);
                if (enrollment is null) return Result<RefundResponse>.Failure("Enrollment is not found.", 404);
                var allocations = await _allocationRepository.ListAsync(q => q.Where(x => x.PaymentId == payment.Id), ct);
                if (allocations.Count == 0) return Result<RefundResponse>.Failure("Payment has no allocations.", 400);
                enrollment.PaidAmount -= request.Amount;
                enrollment.OutstandingAmount += request.Amount;
                enrollment.UpdatedAt = DateTimeOffset.UtcNow;
            }
            var refund = new Refund { PaymentId = payment.Id, EnrollmentId = request.EnrollmentId, RefundNo = $"REF-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}", Amount = request.Amount, Method = request.Method, Status = ERefundStatus.Completed, Reason = request.Reason.Trim(), RequestedAt = DateTimeOffset.UtcNow, RefundedAt = DateTimeOffset.UtcNow, ReferenceCode = request.ReferenceCode?.Trim(), Notes = request.Notes?.Trim(), CreatedAt = DateTimeOffset.UtcNow };
            await _refundRepository.AddAsync(refund, ct);
            await _ledgerRepository.AddAsync(new BillingLedgerEntry { EnrollmentId = request.EnrollmentId, PaymentId = payment.Id, Refund = refund, Type = EBillingLedgerEntryType.RefundIssued, DebitAmount = request.Amount, BalanceAfter = enrollment?.OutstandingAmount ?? 0, Description = request.Reason.Trim(), OccurredAt = DateTimeOffset.UtcNow }, ct);
            return Result<RefundResponse>.Success(refund.ToResponse(), 201);
        }
    }
}
