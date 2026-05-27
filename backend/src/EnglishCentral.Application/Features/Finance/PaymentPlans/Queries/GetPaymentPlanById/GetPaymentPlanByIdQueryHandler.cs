using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlanById
{
    public class GetPaymentPlanByIdQueryHandler : IRequestHandler<GetPaymentPlanByIdQuery, Result<PaymentPlanResponse>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _repository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _itemRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;

        public GetPaymentPlanByIdQueryHandler(
            IFinanceRepository<EnrollmentPaymentPlan> repository,
            IFinanceRepository<EnrollmentPaymentPlanItem> itemRepository,
            IFinanceRepository<Invoice> invoiceRepository)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<Result<PaymentPlanResponse>> Handle(GetPaymentPlanByIdQuery request, CancellationToken ct)
        {
            var plan = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            if (plan is null)
                return Result<PaymentPlanResponse>.Failure("Payment plan is not found.", 404);

            var items = await _itemRepository.ListAsync(q => q.Where(x => x.PaymentPlanId == plan.Id), ct);
            var itemIds = items.Select(x => x.Id).ToList();
            var invoices = await _invoiceRepository.ListAsync(q => q.Where(x => x.PaymentPlanItemId.HasValue && itemIds.Contains(x.PaymentPlanItemId.Value)), ct);

            foreach (var item in items)
                item.Invoice = invoices.FirstOrDefault(x => x.PaymentPlanItemId == item.Id);

            plan.Items = items;
            return Result<PaymentPlanResponse>.Success(plan.ToResponse());
        }
    }
}
