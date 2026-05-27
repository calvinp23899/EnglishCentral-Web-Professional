using EnglishCentral.Application.Features.Finance.Payments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Payments.Commands.CreatePayment
{
    public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Result<PaymentResponse>>
    {
        private readonly IAcademicRepository<Payment> _paymentRepository;
        private readonly IAcademicRepository<Student> _studentRepository;
        private readonly IAcademicRepository<Invoice> _invoiceRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;

        public CreatePaymentCommandHandler(
            IAcademicRepository<Payment> paymentRepository,
            IAcademicRepository<Student> studentRepository,
            IAcademicRepository<Invoice> invoiceRepository,
            IAcademicRepository<Enrollment> enrollmentRepository)
        {
            _paymentRepository = paymentRepository;
            _studentRepository = studentRepository;
            _invoiceRepository = invoiceRepository;
            _enrollmentRepository = enrollmentRepository;
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

            var now = DateTimeOffset.UtcNow;
            var payment = new Payment
            {
                StudentId = request.StudentId,
                PaymentNo = paymentNo,
                PaidAt = request.PaidAt ?? now,
                Amount = request.Amount,
                Method = request.Method,
                Status = PaymentStatus.Completed,
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
                    ? InvoiceStatus.Paid
                    : InvoiceStatus.PartiallyPaid;
                invoice.UpdatedAt = now;

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

            await _paymentRepository.AddAsync(payment, ct);
            return Result<PaymentResponse>.Success(payment.ToResponse(), 201);
        }
    }
}
