using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.CancelEnrollment
{
    public class CancelEnrollmentCommandHandler : IRequestHandler<CancelEnrollmentCommand, Result<EnrollmentResponse>>
    {
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _paymentPlanRepository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _paymentPlanItemRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;
        private readonly ICurrentUserService _currentUserService;

        public CancelEnrollmentCommandHandler(
            IAcademicRepository<Enrollment> enrollmentRepository,
            IFinanceRepository<EnrollmentPaymentPlan> paymentPlanRepository,
            IFinanceRepository<EnrollmentPaymentPlanItem> paymentPlanItemRepository,
            IFinanceRepository<Invoice> invoiceRepository,
            ICurrentUserService currentUserService)
        {
            _enrollmentRepository = enrollmentRepository;
            _paymentPlanRepository = paymentPlanRepository;
            _paymentPlanItemRepository = paymentPlanItemRepository;
            _invoiceRepository = invoiceRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Result<EnrollmentResponse>> Handle(CancelEnrollmentCommand request, CancellationToken ct)
        {
            var enrollment = await _enrollmentRepository.GetByIdAsync(request.Id, ct);
            if (enrollment is null)
                return Result<EnrollmentResponse>.Failure("Enrollment is not found.", 404);
            if (enrollment.Status == EEnrollmentStatus.Dropped)
                return Result<EnrollmentResponse>.Failure("Enrollment is already cancelled.", 409);
            if (enrollment.Status == EEnrollmentStatus.Completed)
                return Result<EnrollmentResponse>.Failure("Completed enrollment cannot be cancelled.", 400);
            if (enrollment.PaidAmount > 0)
                return Result<EnrollmentResponse>.Failure("Enrollment with payments cannot be cancelled. Cancel/refund payments first.", 400);

            var invoices = await _invoiceRepository.ListAsync(
                q => q.Where(x => x.EnrollmentId == request.Id),
                ct,
                asNoTracking: false);
            if (invoices.Any(x => x.PaidAmount > 0))
                return Result<EnrollmentResponse>.Failure("Enrollment with paid invoices cannot be cancelled. Cancel/refund payments first.", 400);

            var now = DateTimeOffset.UtcNow;
            var reason = request.Reason?.Trim();

            enrollment.Status = EEnrollmentStatus.Dropped;
            enrollment.CancellationReason = reason;
            enrollment.CancelledAt = now;
            enrollment.CancelledBy = _currentUserService.UserId;
            enrollment.UpdatedAt = now;

            foreach (var invoice in invoices.Where(x => x.Status != EInvoiceStatus.Cancelled))
            {
                invoice.Status = EInvoiceStatus.Cancelled;
                invoice.UpdatedAt = now;
                invoice.Notes = string.IsNullOrWhiteSpace(invoice.Notes)
                    ? reason
                    : invoice.Notes;
            }

            var paymentPlan = await _paymentPlanRepository.FirstOrDefaultAsync(
                x => x.EnrollmentId == request.Id,
                ct,
                asNoTracking: false);
            if (paymentPlan is not null && paymentPlan.Status != EPaymentPlanStatus.Completed)
            {
                paymentPlan.Status = EPaymentPlanStatus.Cancelled;
                paymentPlan.UpdatedAt = now;

                var items = await _paymentPlanItemRepository.ListAsync(
                    q => q.Where(x => x.PaymentPlanId == paymentPlan.Id),
                    ct,
                    asNoTracking: false);
                foreach (var item in items.Where(x => x.Status != EPaymentPlanItemStatus.Paid))
                {
                    item.Status = EPaymentPlanItemStatus.Cancelled;
                    item.UpdatedAt = now;
                }
            }

            return Result<EnrollmentResponse>.Success(enrollment.ToResponse());
        }
    }
}
