using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Application.Features.Finance.Discounts.DTOs
{
    public record DiscountResponse(
        Guid PublicId,
        long Id,
        string Code,
        string Name,
        EDiscountType Type,
        decimal Value,
        DateOnly? ValidFrom,
        DateOnly? ValidTo,
        bool IsActive,
        int? MaxUsageCount,
        int UsedCount,
        int? MaxUsagePerStudent,
        string? Description);

    public static class DiscountMapping
    {
        public static DiscountResponse ToResponse(this Discount discount)
        {
            return new DiscountResponse(
                discount.PublicId,
                discount.Id,
                discount.Code,
                discount.Name,
                discount.Type,
                discount.Value,
                discount.ValidFrom,
                discount.ValidTo,
                discount.IsActive,
                discount.MaxUsageCount,
                discount.UsedCount,
                discount.MaxUsagePerStudent,
                discount.Description);
        }
    }
}
