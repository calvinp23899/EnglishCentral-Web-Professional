using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Commands.DeletePaymentPlan
{
    public class DeletePaymentPlanCommandHandler : IRequestHandler<DeletePaymentPlanCommand, Result<bool>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _repository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _itemRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;

        public DeletePaymentPlanCommandHandler(
            IFinanceRepository<EnrollmentPaymentPlan> repository,
            IFinanceRepository<EnrollmentPaymentPlanItem> itemRepository,
            IFinanceRepository<Invoice> invoiceRepository)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<Result<bool>> Handle(DeletePaymentPlanCommand request, CancellationToken ct)
        {
            var plan = await _repository.GetByIdAsync(request.Id, ct);
            if (plan is null)
                return Result<bool>.Failure("Payment plan is not found.", 404);

            var items = await _itemRepository.ListAsync(
                q => q.Where(x => x.PaymentPlanId == plan.Id),
                ct,
                false);
            var itemIds = items.Select(x => x.Id).ToList();
            if (await _invoiceRepository.ExistsAsync(
                x => x.PaymentPlanItemId.HasValue && itemIds.Contains(x.PaymentPlanItemId.Value),
                ct))
                return Result<bool>.Failure("Payment plans with invoices cannot be deleted.", 409);

            var now = DateTimeOffset.UtcNow;
            plan.IsDeleted = true;
            plan.DeletedAt = now;
            plan.UpdatedAt = now;
            foreach (var item in items)
            {
                item.IsDeleted = true;
                item.DeletedAt = now;
                item.UpdatedAt = now;
            }

            return Result<bool>.Success(true);
        }
    }
}
