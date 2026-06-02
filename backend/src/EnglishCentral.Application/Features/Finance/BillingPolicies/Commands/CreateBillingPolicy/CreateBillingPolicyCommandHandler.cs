using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.CreateBillingPolicy
{
    public class CreateBillingPolicyCommandHandler : IRequestHandler<CreateBillingPolicyCommand, Result<BillingPolicyResponse>>
    {
        private readonly IFinanceRepository<BillingPolicy> _repository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateBillingPolicyCommandHandler(IFinanceRepository<BillingPolicy> repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<BillingPolicyResponse>> Handle(CreateBillingPolicyCommand request, CancellationToken ct)
        {
            var name = request.Name.Trim();
            if (await _repository.ExistsAsync(x => x.Name == name, ct))
                return Result<BillingPolicyResponse>.Failure("Billing policy name already exists.", 409);

            if (request.IsDefault)
            {
                var currentDefault = await _repository.FirstOrDefaultAsync(x => x.IsDefault, ct, false);
                if (currentDefault is not null)
                {
                    currentDefault.IsDefault = false;
                    currentDefault.UpdatedAt = DateTimeOffset.UtcNow;
                    await _unitOfWork.SaveChangesAsync(ct);
                }
            }

            var policy = new BillingPolicy
            {
                Name = name,
                Type = request.Type,
                NumberOfInstallments = request.NumberOfInstallments,
                IsDefault = request.IsDefault,
                IsActive = request.IsActive,
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(policy, ct);
            await _unitOfWork.SaveChangesAsync(ct);
            return Result<BillingPolicyResponse>.Success(policy.ToResponse(), 201);
        }
    }
}
