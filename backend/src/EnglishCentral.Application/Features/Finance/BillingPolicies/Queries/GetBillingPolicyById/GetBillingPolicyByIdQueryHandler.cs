using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Queries.GetBillingPolicyById
{
    public class GetBillingPolicyByIdQueryHandler : IRequestHandler<GetBillingPolicyByIdQuery, Result<BillingPolicyResponse>>
    {
        private readonly IFinanceRepository<BillingPolicy> _repository;

        public GetBillingPolicyByIdQueryHandler(IFinanceRepository<BillingPolicy> repository)
        {
            _repository = repository;
        }

        public async Task<Result<BillingPolicyResponse>> Handle(GetBillingPolicyByIdQuery request, CancellationToken ct)
        {
            var policy = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return policy is null
                ? Result<BillingPolicyResponse>.Failure("Billing policy is not found.", 404)
                : Result<BillingPolicyResponse>.Success(policy.ToResponse());
        }
    }
}
