using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.UpdatePaymentPlan
{
    public class UpdatePaymentPlanCommandHandler : IRequestHandler<UpdatePaymentPlanCommand, Result<PaymentPlanResponse>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _repository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _itemRepository;
        private readonly IFinanceRepository<BillingPolicy> _policyRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;

        public UpdatePaymentPlanCommandHandler(
            IFinanceRepository<EnrollmentPaymentPlan> repository,
            IFinanceRepository<EnrollmentPaymentPlanItem> itemRepository,
            IFinanceRepository<BillingPolicy> policyRepository,
            IFinanceRepository<Invoice> invoiceRepository)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _policyRepository = policyRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<Result<PaymentPlanResponse>> Handle(UpdatePaymentPlanCommand request, CancellationToken ct)
        {
            var plan = await _repository.GetByIdAsync(request.Id, ct);
            if (plan is null)
                return Result<PaymentPlanResponse>.Failure("Payment plan is not found.", 404);
            if (plan.EnrollmentId != request.EnrollmentId)
                return Result<PaymentPlanResponse>.Failure("Enrollment cannot be changed after payment plan creation.", 400);
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

            var validation = PaymentPlanCommandValidator.Validate(
                request.Type,
                request.TotalAmount,
                request.NumberOfInstallments,
                request.Items);
            if (!validation.IsSuccess)
                return Result<PaymentPlanResponse>.Failure(validation.Error!, validation.StatusCode);

            var items = await _itemRepository.ListAsync(
                q => q.Where(x => x.PaymentPlanId == plan.Id),
                ct,
                false);
            if (!items.Select(x => x.SequenceNumber).OrderBy(x => x)
                .SequenceEqual(request.Items.Select(x => x.SequenceNumber).OrderBy(x => x)))
                return Result<PaymentPlanResponse>.Failure("Payment plan item structure cannot be changed after creation.", 400);

            var itemIds = items.Select(x => x.Id).ToList();
            var invoicedItemIds = (await _invoiceRepository.ListAsync(
                    q => q.Where(x => x.PaymentPlanItemId.HasValue && itemIds.Contains(x.PaymentPlanItemId.Value)),
                    ct))
                .Select(x => x.PaymentPlanItemId!.Value)
                .ToList();

            foreach (var item in items)
            {
                var source = request.Items.Single(x => x.SequenceNumber == item.SequenceNumber);
                if (invoicedItemIds.Contains(item.Id) &&
                    (item.Name != source.Name.Trim() ||
                     item.DueDate != source.DueDate ||
                     item.Amount != source.Amount ||
                     item.Status != source.Status))
                    return Result<PaymentPlanResponse>.Failure("Invoiced payment plan items cannot be changed.", 409);

                item.Name = source.Name.Trim();
                item.DueDate = source.DueDate;
                item.Amount = source.Amount;
                item.Status = source.Status;
                item.UpdatedAt = DateTimeOffset.UtcNow;
            }

            plan.BillingPolicyId = request.BillingPolicyId;
            plan.Type = request.Type;
            plan.TotalAmount = request.TotalAmount;
            plan.NumberOfInstallments = request.NumberOfInstallments;
            plan.Status = request.Status;
            plan.Notes = request.Notes?.Trim();
            plan.UpdatedAt = DateTimeOffset.UtcNow;
            plan.Items = items;

            return Result<PaymentPlanResponse>.Success(plan.ToResponse());
        }
    }
}
