using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.CreatePaymentPlan
{
    public class CreatePaymentPlanCommandHandler : IRequestHandler<CreatePaymentPlanCommand, Result<PaymentPlanResponse>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _repository;
        private readonly IFinanceRepository<BillingPolicy> _policyRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreatePaymentPlanCommandHandler(
            IFinanceRepository<EnrollmentPaymentPlan> repository,
            IFinanceRepository<BillingPolicy> policyRepository,
            IAcademicRepository<Enrollment> enrollmentRepository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _policyRepository = policyRepository;
            _enrollmentRepository = enrollmentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PaymentPlanResponse>> Handle(CreatePaymentPlanCommand request, CancellationToken ct)
        {
            if (!await _enrollmentRepository.ExistsAsync(x => x.Id == request.EnrollmentId, ct))
                return Result<PaymentPlanResponse>.Failure("Enrollment is not found.", 404);
            BillingPolicy? billingPolicy = null;
            if (request.BillingPolicyId.HasValue)
            {
                billingPolicy = await _policyRepository.GetByIdAsync(request.BillingPolicyId.Value, ct);
                if (billingPolicy is null || !billingPolicy.IsActive)
                    return Result<PaymentPlanResponse>.Failure("Active billing policy is not found.", 404);
                if ((int)billingPolicy.Type != (int)request.Type)
                    return Result<PaymentPlanResponse>.Failure("Payment plan type must match billing policy type.", 400);
                if (billingPolicy.Type == EBillingPolicyType.Installment &&
                    billingPolicy.NumberOfInstallments != request.NumberOfInstallments)
                    return Result<PaymentPlanResponse>.Failure("Installment count must match billing policy.", 400);
            }
            if (await _repository.ExistsAsync(x => x.EnrollmentId == request.EnrollmentId, ct, true))
                return Result<PaymentPlanResponse>.Failure("Enrollment already has a payment plan.", 409);

            var validation = PaymentPlanCommandValidator.Validate(
                request.Type,
                request.TotalAmount,
                request.NumberOfInstallments,
                request.Items);
            if (!validation.IsSuccess)
                return Result<PaymentPlanResponse>.Failure(validation.Error!, validation.StatusCode);

            var plan = new EnrollmentPaymentPlan
            {
                EnrollmentId = request.EnrollmentId,
                BillingPolicyId = request.BillingPolicyId,
                Type = request.Type,
                TotalAmount = request.TotalAmount,
                NumberOfInstallments = request.NumberOfInstallments,
                Status = request.Status,
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow,
                Items = request.Items
                    .OrderBy(x => x.SequenceNumber)
                    .Select(x => new EnrollmentPaymentPlanItem
                    {
                        SequenceNumber = x.SequenceNumber,
                        Name = x.Name.Trim(),
                        DueDate = x.DueDate,
                        Amount = x.Amount,
                        Status = x.Status,
                        CreatedAt = DateTimeOffset.UtcNow
                    })
                    .ToList()
            };

            await _repository.AddAsync(plan, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            return Result<PaymentPlanResponse>.Success(plan.ToResponse(), 201);
        }
    }
}
