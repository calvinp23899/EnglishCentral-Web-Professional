using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.UpdateBillingPolicy
{
    public class UpdateBillingPolicyCommandHandler : IRequestHandler<UpdateBillingPolicyCommand, Result<BillingPolicyResponse>>
    {
        private readonly IFinanceRepository<BillingPolicy> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateBillingPolicyCommandHandler(IFinanceRepository<BillingPolicy> repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<BillingPolicyResponse>> Handle(UpdateBillingPolicyCommand request, CancellationToken ct)
        {
            var policy = await _repository.GetByIdAsync(request.Id, ct);
            if (policy is null)
                return Result<BillingPolicyResponse>.Failure("Billing policy is not found.", 404);

            var name = request.Name.Trim();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Name == name, ct))
                return Result<BillingPolicyResponse>.Failure("Billing policy name already exists.", 409);

            if (policy.IsDefault && !request.IsActive)
                return Result<BillingPolicyResponse>.Failure("Default billing policy must be active.", 400);

            policy.Name = name;
            policy.Type = request.Type;
            policy.NumberOfInstallments = request.NumberOfInstallments;
            policy.IsActive = request.IsActive;
            policy.Notes = request.Notes?.Trim();
            policy.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<BillingPolicyResponse>.Success(policy.ToResponse());
        }
    }
}
