using EnglishCentral.Application.Features.Finance.Discounts.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Queries.GetDiscounts
{
    public class GetDiscountsQueryHandler : IRequestHandler<GetDiscountsQuery, Result<PagedResult<DiscountResponse>>>
    {
        private readonly IFinanceRepository<Discount> _repository;
        public GetDiscountsQueryHandler(IFinanceRepository<Discount> repository) => _repository = repository;

        public async Task<Result<PagedResult<DiscountResponse>>> Handle(GetDiscountsQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.Type.HasValue) query = query.Where(x => x.Type == request.Type.Value);
            if (request.IsActive.HasValue) query = query.Where(x => x.IsActive == request.IsActive.Value);
            query = request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt);
            var total = await _repository.CountAsync(_ => query, ct);
            var rows = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            return Result<PagedResult<DiscountResponse>>.Success(PagedResult<DiscountResponse>.Create(rows.Select(x => x.ToResponse()).ToList(), request.Page, request.PageSize, total));
        }
    }
}
