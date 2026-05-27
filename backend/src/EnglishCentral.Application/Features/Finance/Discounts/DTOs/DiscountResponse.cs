using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Finance.Discounts.DTOs
{
    public record DiscountResponse(Guid PublicId, long Id, string Code, string Name, DiscountType Type, decimal Value, DateOnly? ValidFrom, DateOnly? ValidTo, bool IsActive, string? Description);

    public static class DiscountMapping
    {
        public static DiscountResponse ToResponse(this Discount discount)
        {
            return new DiscountResponse(discount.PublicId, discount.Id, discount.Code, discount.Name, discount.Type, discount.Value, discount.ValidFrom, discount.ValidTo, discount.IsActive, discount.Description);
        }
    }
}
