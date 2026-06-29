using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Queries.GetBillingPolicies
{
    public class GetBillingPoliciesQueryHandler : IRequestHandler<GetBillingPoliciesQuery, Result<PagedResult<BillingPolicyResponse>>>
    {
        private readonly IFinanceRepository<BillingPolicy> _repository;

        public GetBillingPoliciesQueryHandler(IFinanceRepository<BillingPolicy> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<BillingPolicyResponse>>> Handle(GetBillingPoliciesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keyword));
            }
            if (request.Type.HasValue)
                query = query.Where(x => x.Type == request.Type.Value);
            if (request.IsActive.HasValue)
                query = query.Where(x => x.IsActive == request.IsActive.Value);
            if (request.IsDefault.HasValue)
                query = query.Where(x => x.IsDefault == request.IsDefault.Value);

            query = request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt);
            var totalItems = await _repository.CountAsync(_ => query, ct);
            var policies = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = policies.Select(x => x.ToResponse()).ToList();

            return Result<PagedResult<BillingPolicyResponse>>.Success(PagedResult<BillingPolicyResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
