using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
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
        private readonly IAcademicRepository<Course> _courseRepository;
        private readonly IFinanceRepository<BillingPolicy> _billingPolicyRepository;
        private readonly IFinanceRepository<Discount> _discountRepository;
        private readonly IFinanceRepository<EnrollmentDiscount> _enrollmentDiscountRepository;
        private readonly ICodeGenerator _codeGenerator;
        private readonly IUnitOfWork _unitOfWork;

        public CreateEnrollmentCommandHandler(
            IAcademicRepository<Enrollment> repository,
            IAcademicRepository<Student> studentRepository,
            IAcademicRepository<AcademicClass> classRepository,
            IAcademicRepository<Course> courseRepository,
            IFinanceRepository<BillingPolicy> billingPolicyRepository,
            IFinanceRepository<Discount> discountRepository,
            IFinanceRepository<EnrollmentDiscount> enrollmentDiscountRepository,
            ICodeGenerator codeGenerator,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _studentRepository = studentRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _billingPolicyRepository = billingPolicyRepository;
            _discountRepository = discountRepository;
            _enrollmentDiscountRepository = enrollmentDiscountRepository;
            _codeGenerator = codeGenerator;
            _unitOfWork = unitOfWork;
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

            var enrollmentCode = $"ENR-{_codeGenerator.GenerateCode()}";

            if (await _repository.ExistsAsync(x => x.EnrollmentCode == enrollmentCode, ct))
                return Result<EnrollmentResponse>.Failure("Enrollment code already exists.", 409);

            var billingPolicyResult = await ResolveBillingPolicyAsync(request, classroom, ct);
            if (!billingPolicyResult.IsSuccess)
                return Result<EnrollmentResponse>.Failure(billingPolicyResult.Error!, billingPolicyResult.StatusCode);

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
            if (paidAmount > 0)
                return Result<EnrollmentResponse>.Failure("Initial payment must be recorded through the payment endpoint after invoice generation.", 400);
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

            var paymentPlanResult = BuildPaymentPlan(request, enrollment, classroom, finalAmount, billingPolicyResult.Data);
            if (!paymentPlanResult.IsSuccess)
                return Result<EnrollmentResponse>.Failure(paymentPlanResult.Error!, paymentPlanResult.StatusCode);

            await IncrementDiscountUsageAsync(request, ct);

            await _repository.AddAsync(enrollment, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            return Result<EnrollmentResponse>.Success(enrollment.ToResponse(), 201);
        }

        private async Task IncrementDiscountUsageAsync(CreateEnrollmentCommand request, CancellationToken ct)
        {
            if (request.Discounts is null)
                return;

            foreach (var discountId in request.Discounts
                .Where(x => x.DiscountId.HasValue)
                .Select(x => x.DiscountId!.Value)
                .Distinct())
            {
                var discount = await _discountRepository.GetByIdAsync(discountId, ct);
                if (discount is null)
                    continue;

                discount.UsedCount += 1;
                discount.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        private async Task<Result<List<EnrollmentDiscount>>> BuildEnrollmentDiscountsAsync(
            CreateEnrollmentCommand request,
            decimal tuitionFee,
            CancellationToken ct)
        {
            var result = new List<EnrollmentDiscount>();
            if (request.Discounts is null || request.Discounts.Count == 0)
                return Result<List<EnrollmentDiscount>>.Success(result);

            var duplicatedDiscountId = request.Discounts
                .Where(x => x.DiscountId.HasValue)
                .GroupBy(x => x.DiscountId!.Value)
                .FirstOrDefault(x => x.Count() > 1);
            if (duplicatedDiscountId is not null)
                return Result<List<EnrollmentDiscount>>.Failure("Discount code cannot be applied multiple times to the same enrollment.", 400);

            foreach (var discountRequest in request.Discounts)
            {
                Discount? discount = null;
                if (discountRequest.DiscountId.HasValue)
                {
                    discount = await _discountRepository.GetByIdAsync(discountRequest.DiscountId.Value, ct);
                    if (discount is null)
                        return Result<List<EnrollmentDiscount>>.Failure("Discount is not found.", 404);
                    var usageValidation = await ValidateDiscountUsageAsync(discount, request.StudentId, ct);
                    if (!usageValidation.IsSuccess)
                        return Result<List<EnrollmentDiscount>>.Failure(usageValidation.Error!, usageValidation.StatusCode);
                }

                var type = discount?.Type ?? discountRequest.Type!.Value;
                var value = discount?.Value ?? discountRequest.Value!.Value;
                var amount = discount is not null
                    ? CalculateDiscountAmount(tuitionFee, type, value)
                    : discountRequest.Amount ?? CalculateDiscountAmount(tuitionFee, type, value);
                if (amount > tuitionFee)
                    return Result<List<EnrollmentDiscount>>.Failure("Discount amount cannot be greater than tuition fee.", 400);

                result.Add(new EnrollmentDiscount
                {
                    DiscountId = discount?.Id,
                    Name = discount?.Code ?? discountRequest.Name?.Trim() ?? "Manual discount",
                    Type = type,
                    Value = value,
                    Amount = amount,
                    Reason = discountRequest.Reason?.Trim(),
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }

            return Result<List<EnrollmentDiscount>>.Success(result);
        }

        private async Task<Result<bool>> ValidateDiscountUsageAsync(
            Discount discount,
            long studentId,
            CancellationToken ct)
        {
            if (!discount.IsActive)
                return Result<bool>.Failure("Discount is inactive.", 400);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (discount.ValidFrom.HasValue && today < discount.ValidFrom.Value)
                return Result<bool>.Failure("Discount is not valid yet.", 400);
            if (discount.ValidTo.HasValue && today > discount.ValidTo.Value)
                return Result<bool>.Failure("Discount is expired.", 400);

            if (discount.MaxUsageCount.HasValue && discount.UsedCount >= discount.MaxUsageCount.Value)
                return Result<bool>.Failure("Discount usage limit has been reached.", 400);

            if (discount.MaxUsagePerStudent.HasValue)
            {
                var enrollmentIds = await _repository.ListAsync(
                    q => q.Where(x => x.StudentId == studentId),
                    ct);
                var enrollmentIdValues = enrollmentIds.Select(x => x.Id).ToList();
                if (enrollmentIdValues.Count > 0)
                {
                    var studentUsageCount = await _enrollmentDiscountRepository.CountAsync(
                        q => q.Where(x =>
                            x.DiscountId == discount.Id &&
                            enrollmentIdValues.Contains(x.EnrollmentId)),
                        ct);
                    if (studentUsageCount >= discount.MaxUsagePerStudent.Value)
                        return Result<bool>.Failure("Student discount usage limit has been reached.", 400);
                }
            }

            return Result<bool>.Success(true);
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
            decimal finalAmount,
            BillingPolicy? billingPolicy)
        {
            if (finalAmount == 0)
                return Result<bool>.Success(true);

            var planRequest = request.PaymentPlan;
            List<CreateEnrollmentPaymentPlanItemRequest> items;
            if (planRequest is not null)
            {
                items = planRequest.Items.ToList();
            }
            else
            {
                var defaultPlanResult = BuildDefaultPaymentPlanItems(request, classroom, finalAmount, billingPolicy);
                if (!defaultPlanResult.IsSuccess)
                    return Result<bool>.Failure(defaultPlanResult.Error!, defaultPlanResult.StatusCode);
                items = defaultPlanResult.Data!;
            }

            if (items.Count == 0)
                return Result<bool>.Failure("Payment plan must have at least one item.", 400);

            if (items.Select(x => x.SequenceNumber).Distinct().Count() != items.Count)
                return Result<bool>.Failure("Payment plan item sequence number must be unique.", 400);

            var itemsTotal = items.Sum(x => x.Amount);
            if (itemsTotal != finalAmount)
                return Result<bool>.Failure("Payment plan items total amount must equal enrollment final amount.", 400);

            var planType = planRequest?.Type ?? ToPaymentPlanType(billingPolicy?.Type);
            var numberOfInstallments = planRequest?.NumberOfInstallments ??
                (planType == EPaymentPlanType.Installment || planType == EPaymentPlanType.Monthly ? items.Count : null);

            if (planType == EPaymentPlanType.FullPayment && items.Count != 1)
                return Result<bool>.Failure("Full payment plan must have exactly one item.", 400);
            if (planType == EPaymentPlanType.Installment && numberOfInstallments.HasValue && items.Count != numberOfInstallments.Value)
                return Result<bool>.Failure("Installment count must match payment plan item count.", 400);

            var paymentPlan = new EnrollmentPaymentPlan
            {
                Enrollment = enrollment,
                BillingPolicyId = planRequest?.BillingPolicyId ?? billingPolicy?.Id,
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

        private async Task<Result<BillingPolicy?>> ResolveBillingPolicyAsync(
            CreateEnrollmentCommand request,
            AcademicClass classroom,
            CancellationToken ct)
        {
            if (request.PaymentPlan?.BillingPolicyId.HasValue == true)
            {
                var selectedPolicy = await _billingPolicyRepository.GetByIdAsync(request.PaymentPlan.BillingPolicyId.Value, ct);
                if (selectedPolicy is null || !selectedPolicy.IsActive)
                    return Result<BillingPolicy?>.Failure("Active billing policy is not found.", 404);
                if (ToPaymentPlanType(selectedPolicy.Type) != request.PaymentPlan.Type)
                    return Result<BillingPolicy?>.Failure("Payment plan type must match billing policy type.", 400);
                if (selectedPolicy.Type == EBillingPolicyType.Installment &&
                    selectedPolicy.NumberOfInstallments != request.PaymentPlan.NumberOfInstallments)
                    return Result<BillingPolicy?>.Failure("Installment count must match billing policy.", 400);

                return Result<BillingPolicy?>.Success(selectedPolicy);
            }

            // Explicit custom schedules without a policy are allowed per enrollment.
            if (request.PaymentPlan is not null)
                return Result<BillingPolicy?>.Success(null);

            if (classroom.BillingPolicyId.HasValue)
                return await GetConfiguredPolicyAsync(classroom.BillingPolicyId.Value, "Class", ct);

            var course = await _courseRepository.GetByIdAsync(classroom.CourseId, ct);
            if (course?.DefaultBillingPolicyId.HasValue == true)
                return await GetConfiguredPolicyAsync(course.DefaultBillingPolicyId.Value, "Course", ct);

            var defaultPolicy = await _billingPolicyRepository.FirstOrDefaultAsync(x => x.IsDefault && x.IsActive, ct);
            return Result<BillingPolicy?>.Success(defaultPolicy);
        }

        private async Task<Result<BillingPolicy?>> GetConfiguredPolicyAsync(long id, string scope, CancellationToken ct)
        {
            var policy = await _billingPolicyRepository.GetByIdAsync(id, ct);
            return policy is null || !policy.IsActive
                ? Result<BillingPolicy?>.Failure($"{scope} billing policy is inactive or not found.", 409)
                : Result<BillingPolicy?>.Success(policy);
        }

        private static Result<List<CreateEnrollmentPaymentPlanItemRequest>> BuildDefaultPaymentPlanItems(
            CreateEnrollmentCommand request,
            AcademicClass classroom,
            decimal finalAmount,
            BillingPolicy? policy)
        {
            var startDate = request.StartDate ?? classroom.StartDate;
            var endDate = request.EndDate ?? classroom.EndDate;
            var type = policy?.Type ?? EBillingPolicyType.FullPayment;

            if (type == EBillingPolicyType.Installment && policy?.NumberOfInstallments is not > 1)
                return Result<List<CreateEnrollmentPaymentPlanItemRequest>>.Failure(
                    "Installment billing policy requires more than one installment.", 400);

            var dueDates = type switch
            {
                EBillingPolicyType.Monthly => BuildMonthlyDueDates(startDate, endDate),
                EBillingPolicyType.Installment => BuildInstallmentDueDates(startDate, endDate, policy!.NumberOfInstallments!.Value),
                _ => [startDate]
            };
            var amounts = SplitAmount(finalAmount, dueDates.Count);
            var items = dueDates
                .Select((dueDate, index) => new CreateEnrollmentPaymentPlanItemRequest(
                    index + 1,
                    dueDates.Count == 1 ? "Full payment" : $"Installment {index + 1}",
                    dueDate,
                    amounts[index]))
                .ToList();

            return Result<List<CreateEnrollmentPaymentPlanItemRequest>>.Success(items);
        }

        private static List<DateOnly> BuildMonthlyDueDates(DateOnly startDate, DateOnly endDate)
        {
            var dueDates = new List<DateOnly>();
            for (var month = 0; ; month++)
            {
                var dueDate = startDate.AddMonths(month);
                if (dueDate > endDate)
                    break;
                dueDates.Add(dueDate);
            }

            return dueDates.Count > 0 ? dueDates : [startDate];
        }

        private static List<DateOnly> BuildInstallmentDueDates(DateOnly startDate, DateOnly endDate, int count)
        {
            var durationDays = Math.Max(0, endDate.DayNumber - startDate.DayNumber);
            return Enumerable.Range(0, count)
                .Select(index => startDate.AddDays(durationDays * index / count))
                .ToList();
        }

        private static List<decimal> SplitAmount(decimal totalAmount, int count)
        {
            var regularAmount = Math.Round(totalAmount / count, 2);
            var amounts = Enumerable.Repeat(regularAmount, count).ToList();
            amounts[^1] = totalAmount - regularAmount * (count - 1);
            return amounts;
        }

        private static EPaymentPlanType ToPaymentPlanType(EBillingPolicyType? type)
        {
            return type.HasValue ? (EPaymentPlanType)(int)type.Value : EPaymentPlanType.FullPayment;
        }
    }
}
