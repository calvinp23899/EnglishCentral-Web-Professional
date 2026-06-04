using EnglishCentral.Application.Features.Finance.PaymentPlans.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.PaymentPlans.Queries.GetPaymentPlans
{
    public class GetPaymentPlansQueryHandler : IRequestHandler<GetPaymentPlansQuery, Result<PagedResult<PaymentPlanResponse>>>
    {
        private readonly IFinanceRepository<EnrollmentPaymentPlan> _repository;
        private readonly IFinanceRepository<EnrollmentPaymentPlanItem> _itemRepository;
        private readonly IFinanceRepository<Invoice> _invoiceRepository;

        public GetPaymentPlansQueryHandler(
            IFinanceRepository<EnrollmentPaymentPlan> repository,
            IFinanceRepository<EnrollmentPaymentPlanItem> itemRepository,
            IFinanceRepository<Invoice> invoiceRepository)
        {
            _repository = repository;
            _itemRepository = itemRepository;
            _invoiceRepository = invoiceRepository;
        }

        public async Task<Result<PagedResult<PaymentPlanResponse>>> Handle(GetPaymentPlansQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.EnrollmentId.HasValue)
                query = query.Where(x => x.EnrollmentId == request.EnrollmentId.Value);
            if (request.Type.HasValue)
                query = query.Where(x => x.Type == request.Type.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            query = request.IsDescending
                ? query.OrderByDescending(x => x.CreatedAt)
                : query.OrderBy(x => x.CreatedAt);

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var plans = await _repository.ListAsync(
                _ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize),
                ct);
            var planIds = plans.Select(x => x.Id).ToList();
            var items = await _itemRepository.ListAsync(
                q => q.Where(x => planIds.Contains(x.PaymentPlanId)),
                ct);
            var itemIds = items.Select(x => x.Id).ToList();
            var invoices = await _invoiceRepository.ListAsync(
                q => q.Where(x => x.PaymentPlanItemId.HasValue && itemIds.Contains(x.PaymentPlanItemId.Value)),
                ct);

            foreach (var item in items)
                item.Invoice = invoices.FirstOrDefault(x => x.PaymentPlanItemId == item.Id);

            foreach (var plan in plans)
                plan.Items = items.Where(x => x.PaymentPlanId == plan.Id).ToList();

            return Result<PagedResult<PaymentPlanResponse>>.Success(
                PagedResult<PaymentPlanResponse>.Create(
                    plans.Select(x => x.ToResponse()).ToList(),
                    request.Page,
                    request.PageSize,
                    totalItems));
        }
    }
}
