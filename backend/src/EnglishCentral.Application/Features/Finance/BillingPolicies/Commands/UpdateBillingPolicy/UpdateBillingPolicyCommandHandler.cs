using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.UpdateBillingPolicy
{
    public class UpdateBillingPolicyCommandHandler : IRequestHandler<UpdateBillingPolicyCommand, Result<BillingPolicyResponse>>
    {
        private readonly IFinanceRepository<BillingPolicy> _repository;

        public UpdateBillingPolicyCommandHandler(IFinanceRepository<BillingPolicy> repository)
        {
            _repository = repository;
        }

        public async Task<Result<BillingPolicyResponse>> Handle(UpdateBillingPolicyCommand request, CancellationToken ct)
        {
            var policy = await _repository.GetByIdAsync(request.Id, ct);
            if (policy is null)
                return Result<BillingPolicyResponse>.Failure("Billing policy is not found.", 404);

            var name = request.Name.Trim();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Name == name, ct))
                return Result<BillingPolicyResponse>.Failure("Billing policy name already exists.", 409);

            policy.Name = name;
            policy.Type = request.Type;
            policy.NumberOfInstallments = request.NumberOfInstallments;
            policy.IsDefault = request.IsDefault;
            policy.IsActive = request.IsActive;
            policy.Notes = request.Notes?.Trim();
            policy.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<BillingPolicyResponse>.Success(policy.ToResponse());
        }
    }
}
