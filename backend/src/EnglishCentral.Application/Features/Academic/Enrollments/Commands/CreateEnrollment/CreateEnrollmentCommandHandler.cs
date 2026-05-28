using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
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
        private readonly IFinanceRepository<BillingPolicy> _billingPolicyRepository;
        private readonly IFinanceRepository<Discount> _discountRepository;

        public CreateEnrollmentCommandHandler(
            IAcademicRepository<Enrollment> repository,
            IAcademicRepository<Student> studentRepository,
            IAcademicRepository<AcademicClass> classRepository,
            IFinanceRepository<BillingPolicy> billingPolicyRepository,
            IFinanceRepository<Discount> discountRepository)
        {
            _repository = repository;
            _studentRepository = studentRepository;
            _classRepository = classRepository;
            _billingPolicyRepository = billingPolicyRepository;
            _discountRepository = discountRepository;
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
            var discountResult = await BuildEnrollmentDiscountsAsync(request, tuitionFee, ct);
            if (!discountResult.IsSuccess)
                return Result<EnrollmentResponse>.Failure(discountResult.Error!, discountResult.StatusCode);

            var enrollmentDiscounts = discountResult.Data!;
            var discountAmount = enrollmentDiscounts.Count > 0 ? enrollmentDiscounts.Sum(x => x.Amount) : request.DiscountAmount;
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

            foreach (var discount in enrollmentDiscounts)
                enrollment.Discounts.Add(discount);

            var paymentPlanResult = BuildPaymentPlan(request, enrollment, classroom, finalAmount);
            if (!paymentPlanResult.IsSuccess)
                return Result<EnrollmentResponse>.Failure(paymentPlanResult.Error!, paymentPlanResult.StatusCode);

            await _repository.AddAsync(enrollment, ct);
            return Result<EnrollmentResponse>.Success(enrollment.ToResponse(), 201);
        }

        private async Task<Result<List<EnrollmentDiscount>>> BuildEnrollmentDiscountsAsync(
            CreateEnrollmentCommand request,
            decimal tuitionFee,
            CancellationToken ct)
        {
            var result = new List<EnrollmentDiscount>();
            if (request.Discounts is null || request.Discounts.Count == 0)
                return Result<List<EnrollmentDiscount>>.Success(result);

            foreach (var discountRequest in request.Discounts)
            {
                Discount? discount = null;
                if (discountRequest.DiscountId.HasValue)
                {
                    discount = await _discountRepository.GetByIdAsync(discountRequest.DiscountId.Value, ct);
                    if (discount is null)
                        return Result<List<EnrollmentDiscount>>.Failure("Discount is not found.", 404);
                    if (!discount.IsActive)
                        return Result<List<EnrollmentDiscount>>.Failure("Discount is inactive.", 400);
                }

                var type = discount?.Type ?? discountRequest.Type;
                var value = discount?.Value ?? discountRequest.Value;
                var amount = discountRequest.Amount ?? CalculateDiscountAmount(tuitionFee, type, value);
                if (amount > tuitionFee)
                    return Result<List<EnrollmentDiscount>>.Failure("Discount amount cannot be greater than tuition fee.", 400);

                result.Add(new EnrollmentDiscount
                {
                    DiscountId = discount?.Id,
                    Name = discount?.Name ?? discountRequest.Name?.Trim() ?? "Manual discount",
                    Type = type,
                    Value = value,
                    Amount = amount,
                    Reason = discountRequest.Reason?.Trim(),
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }

            return Result<List<EnrollmentDiscount>>.Success(result);
        }

        private static decimal CalculateDiscountAmount(decimal baseAmount, EDiscountType type, decimal value)
        {
            return type == EDiscountType.Percentage
                ? Math.Round(baseAmount * value / 100m, 2)
                : value;
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

            var planType = planRequest?.Type ?? EPaymentPlanType.FullPayment;
            var numberOfInstallments = planRequest?.NumberOfInstallments;

            if (planType == EPaymentPlanType.FullPayment && items.Count != 1)
                return Result<bool>.Failure("Full payment plan must have exactly one item.", 400);
            if (planType == EPaymentPlanType.Installment && numberOfInstallments.HasValue && items.Count != numberOfInstallments.Value)
                return Result<bool>.Failure("Installment count must match payment plan item count.", 400);

            var paymentPlan = new EnrollmentPaymentPlan
            {
                Enrollment = enrollment,
                BillingPolicyId = planRequest?.BillingPolicyId,
                Type = planType,
                NumberOfInstallments = numberOfInstallments,
                TotalAmount = finalAmount,
                Status = EPaymentPlanStatus.Active,
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
                    Status = EPaymentPlanItemStatus.Pending,
                    CreatedAt = DateTimeOffset.UtcNow
                };

                paymentPlan.Items.Add(item);
            }

            enrollment.PaymentPlan = paymentPlan;
            return Result<bool>.Success(true);
        }
    }
}
