using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.CreateEnrollment
{
    public class CreateEnrollmentCommandHandler : IRequestHandler<CreateEnrollmentCommand, Result<EnrollmentResponse>>
    {
        private readonly IAcademicRepository<Enrollment> _repository;
        private readonly IAcademicRepository<Student> _studentRepository;
        private readonly IAcademicRepository<AcademicClass> _classRepository;
        private readonly IAcademicRepository<BillingPolicy> _billingPolicyRepository;

        public CreateEnrollmentCommandHandler(
            IAcademicRepository<Enrollment> repository,
            IAcademicRepository<Student> studentRepository,
            IAcademicRepository<AcademicClass> classRepository,
            IAcademicRepository<BillingPolicy> billingPolicyRepository)
        {
            _repository = repository;
            _studentRepository = studentRepository;
            _classRepository = classRepository;
            _billingPolicyRepository = billingPolicyRepository;
        }

        public async Task<Result<EnrollmentResponse>> Handle(CreateEnrollmentCommand request, CancellationToken ct)
        {
            if (!await _studentRepository.ExistsAsync(x => x.Id == request.StudentId, ct))
                return Result<EnrollmentResponse>.Failure("Student is not found.", 404);

            var classroom = await _classRepository.GetByIdAsync(request.ClassId, ct);
            if (classroom is null)
                return Result<EnrollmentResponse>.Failure("Class is not found.", 404);

            if (await _repository.ExistsAsync(x => x.StudentId == request.StudentId && x.ClassId == request.ClassId, ct))
                return Result<EnrollmentResponse>.Failure("Student is already enrolled in this class.", 409);

            var enrollmentCode = string.IsNullOrWhiteSpace(request.EnrollmentCode)
                ? $"ENR-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}"
                : request.EnrollmentCode.Trim();

            if (await _repository.ExistsAsync(x => x.EnrollmentCode == enrollmentCode, ct))
                return Result<EnrollmentResponse>.Failure("Enrollment code already exists.", 409);

            if (request.PaymentPlan?.BillingPolicyId.HasValue == true &&
                !await _billingPolicyRepository.ExistsAsync(x => x.Id == request.PaymentPlan.BillingPolicyId.Value, ct))
                return Result<EnrollmentResponse>.Failure("Billing policy is not found.", 404);

            var tuitionFee = request.TuitionFee > 0 ? request.TuitionFee : classroom.TuitionFeeSnapshot;
            var discountAmount = request.DiscountAmount;
            var finalAmount = request.FinalAmount > 0 ? request.FinalAmount : tuitionFee - discountAmount;
            var paidAmount = request.PaidAmount;
            var outstandingAmount = request.OutstandingAmount > 0 ? request.OutstandingAmount : finalAmount - paidAmount;

            if (finalAmount < 0)
                return Result<EnrollmentResponse>.Failure("Final amount cannot be negative.", 400);
            if (paidAmount > finalAmount)
                return Result<EnrollmentResponse>.Failure("Paid amount cannot be greater than final amount.", 400);
            if (outstandingAmount != finalAmount - paidAmount)
                return Result<EnrollmentResponse>.Failure("Outstanding amount must equal final amount minus paid amount.", 400);

            var enrollment = new Enrollment
            {
                StudentId = request.StudentId,
                ClassId = request.ClassId,
                EnrollmentCode = enrollmentCode,
                EnrolledAt = request.EnrolledAt ?? DateTimeOffset.UtcNow,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = request.Status,
                TuitionFee = tuitionFee,
                DiscountAmount = discountAmount,
                FinalAmount = finalAmount,
                PaidAmount = paidAmount,
                OutstandingAmount = outstandingAmount,
                CancellationReason = request.CancellationReason?.Trim(),
                CancelledAt = request.CancelledAt,
                CancelledBy = request.CancelledBy,
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            var paymentPlanResult = BuildPaymentPlan(request, enrollment, classroom, finalAmount);
            if (!paymentPlanResult.IsSuccess)
                return Result<EnrollmentResponse>.Failure(paymentPlanResult.Error!, paymentPlanResult.StatusCode);

            await _repository.AddAsync(enrollment, ct);
            return Result<EnrollmentResponse>.Success(enrollment.ToResponse(), 201);
        }

        private static Result<bool> BuildPaymentPlan(
            CreateEnrollmentCommand request,
            Enrollment enrollment,
            AcademicClass classroom,
            decimal finalAmount)
        {
            if (finalAmount == 0)
                return Result<bool>.Success(true);

            var planRequest = request.PaymentPlan;
            var items = planRequest?.Items?.ToList() ??
            [
                new CreateEnrollmentPaymentPlanItemRequest(
                    1,
                    "Full payment",
                    request.StartDate ?? classroom.StartDate,
                    finalAmount)
            ];

            if (items.Count == 0)
                return Result<bool>.Failure("Payment plan must have at least one item.", 400);

            if (items.Select(x => x.SequenceNumber).Distinct().Count() != items.Count)
                return Result<bool>.Failure("Payment plan item sequence number must be unique.", 400);

            var itemsTotal = items.Sum(x => x.Amount);
            if (itemsTotal != finalAmount)
                return Result<bool>.Failure("Payment plan items total amount must equal enrollment final amount.", 400);

            var planType = planRequest?.Type ?? PaymentPlanType.FullPayment;
            var numberOfInstallments = planRequest?.NumberOfInstallments;

            if (planType == PaymentPlanType.FullPayment && items.Count != 1)
                return Result<bool>.Failure("Full payment plan must have exactly one item.", 400);
            if (planType == PaymentPlanType.Installment && numberOfInstallments.HasValue && items.Count != numberOfInstallments.Value)
                return Result<bool>.Failure("Installment count must match payment plan item count.", 400);

            var paymentPlan = new EnrollmentPaymentPlan
            {
                Enrollment = enrollment,
                BillingPolicyId = planRequest?.BillingPolicyId,
                Type = planType,
                NumberOfInstallments = numberOfInstallments,
                TotalAmount = finalAmount,
                Status = PaymentPlanStatus.Active,
                Notes = planRequest?.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            foreach (var itemRequest in items.OrderBy(x => x.SequenceNumber))
            {
                var item = new EnrollmentPaymentPlanItem
                {
                    PaymentPlan = paymentPlan,
                    SequenceNumber = itemRequest.SequenceNumber,
                    Name = itemRequest.Name.Trim(),
                    DueDate = itemRequest.DueDate,
                    Amount = itemRequest.Amount,
                    Status = PaymentPlanItemStatus.Invoiced,
                    CreatedAt = DateTimeOffset.UtcNow
                };

                var invoice = new Invoice
                {
                    Enrollment = enrollment,
                    PaymentPlanItem = item,
                    InvoiceNo = $"INV-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}-{itemRequest.SequenceNumber}",
                    IssuedAt = DateTimeOffset.UtcNow,
                    DueDate = itemRequest.DueDate,
                    SubtotalAmount = itemRequest.Amount,
                    DiscountAmount = 0,
                    TaxAmount = 0,
                    TotalAmount = itemRequest.Amount,
                    PaidAmount = 0,
                    OutstandingAmount = itemRequest.Amount,
                    Status = InvoiceStatus.Issued,
                    Notes = itemRequest.Name.Trim(),
                    CreatedAt = DateTimeOffset.UtcNow
                };

                invoice.Lines.Add(new InvoiceLine
                {
                    Invoice = invoice,
                    ItemType = BillingItemType.Tuition,
                    Description = itemRequest.Name.Trim(),
                    Quantity = 1,
                    UnitPrice = itemRequest.Amount,
                    DiscountAmount = 0,
                    LineTotal = itemRequest.Amount,
                    CreatedAt = DateTimeOffset.UtcNow
                });

                paymentPlan.Items.Add(item);
                enrollment.Invoices.Add(invoice);
            }

            enrollment.PaymentPlan = paymentPlan;
            return Result<bool>.Success(true);
        }
    }
}
