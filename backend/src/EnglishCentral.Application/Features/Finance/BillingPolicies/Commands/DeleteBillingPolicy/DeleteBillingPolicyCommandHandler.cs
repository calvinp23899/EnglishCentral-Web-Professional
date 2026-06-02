using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.DeleteBillingPolicy
{
    public class DeleteBillingPolicyCommandHandler : IRequestHandler<DeleteBillingPolicyCommand, Result<bool>>
    {
        private readonly IFinanceRepository<BillingPolicy> _repository;

        public DeleteBillingPolicyCommandHandler(IFinanceRepository<BillingPolicy> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteBillingPolicyCommand request, CancellationToken ct)
        {
            var policy = await _repository.GetByIdAsync(request.Id, ct);
            if (policy is null)
                return Result<bool>.Failure("Billing policy is not found.", 404);
            if (policy.IsDefault)
                return Result<bool>.Failure("Default billing policy cannot be deleted. Set another default policy first.", 409);

            policy.IsDeleted = true;
            policy.DeletedAt = DateTimeOffset.UtcNow;
            policy.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
