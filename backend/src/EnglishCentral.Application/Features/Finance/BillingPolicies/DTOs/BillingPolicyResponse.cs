using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs
{
    public record BillingPolicyResponse(
        Guid PublicId,
        long Id,
        string Name,
        BillingPolicyType Type,
        int? NumberOfInstallments,
        bool IsDefault,
        bool IsActive,
        string? Notes);

    public static class BillingPolicyMapping
    {
        public static BillingPolicyResponse ToResponse(this BillingPolicy policy)
        {
            return new BillingPolicyResponse(
                policy.PublicId,
                policy.Id,
                policy.Name,
                policy.Type,
                policy.NumberOfInstallments,
                policy.IsDefault,
                policy.IsActive,
                policy.Notes);
        }
    }
}
