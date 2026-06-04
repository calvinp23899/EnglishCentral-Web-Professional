using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.CreateBillingPolicy
{
    public record CreateBillingPolicyCommand(
        string Name,
        EBillingPolicyType Type,
        int? NumberOfInstallments,
        bool IsActive,
        string? Notes) : IRequest<Result<BillingPolicyResponse>>;
}
