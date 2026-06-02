using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.CreatePaymentPlan
{
    public class CreatePaymentPlanCommandHandler : IRequestHandler<CreatePaymentPlanCommand, Result<PaymentPlanResponse>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _repository;
        private readonly IFinanceRepository<BillingPolicy> _policyRepository;
        private readonly IAcademicRepository<Enrollment> _enrollmentRepository;

        public CreatePaymentPlanCommandHandler(
            IFinanceRepository<EnrollmentPaymentPlan> repository,
            IFinanceRepository<BillingPolicy> policyRepository,
            IAcademicRepository<Enrollment> enrollmentRepository)
        {
            _repository = repository;
            _policyRepository = policyRepository;
            _enrollmentRepository = enrollmentRepository;
        }

        public async Task<Result<PaymentPlanResponse>> Handle(CreatePaymentPlanCommand request, CancellationToken ct)
        {
            if (!await _enrollmentRepository.ExistsAsync(x => x.Id == request.EnrollmentId, ct))
                return Result<PaymentPlanResponse>.Failure("Enrollment is not found.", 404);
            if (request.BillingPolicyId.HasValue &&
                !await _policyRepository.ExistsAsync(x => x.Id == request.BillingPolicyId.Value, ct))
                return Result<PaymentPlanResponse>.Failure("Billing policy is not found.", 404);
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
            return Result<PaymentPlanResponse>.Success(plan.ToResponse(), 201);
        }
    }
}
