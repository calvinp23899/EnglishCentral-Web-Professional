using EnglishCentral.Application.Features.Finance.Discounts.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Commands.UpdateDiscount
{
    public class UpdateDiscountCommandHandler : IRequestHandler<UpdateDiscountCommand, Result<DiscountResponse>>
    {
        private readonly IFinanceRepository<Discount> _repository;
        public UpdateDiscountCommandHandler(IFinanceRepository<Discount> repository) => _repository = repository;
        public async Task<Result<DiscountResponse>> Handle(UpdateDiscountCommand request, CancellationToken ct)
        {
            var discount = await _repository.GetByIdAsync(request.Id, ct);
            if (discount is null) return Result<DiscountResponse>.Failure("Discount is not found.", 404);
            var code = request.Code.Trim();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Code == code, ct)) return Result<DiscountResponse>.Failure("Discount code already exists.", 409);
            if (request.MaxUsageCount.HasValue && request.MaxUsageCount.Value < discount.UsedCount)
                return Result<DiscountResponse>.Failure("Max usage count cannot be less than used count.", 400);

            discount.Code = code;
            discount.Name = code;
            discount.Type = request.Type;
            discount.Value = request.Value;
            discount.ValidFrom = request.ValidFrom;
            discount.ValidTo = request.ValidTo;
            discount.IsActive = request.IsActive;
            discount.MaxUsageCount = request.MaxUsageCount;
            discount.MaxUsagePerStudent = request.MaxUsagePerStudent;
            discount.Description = request.Description?.Trim();
            discount.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<DiscountResponse>.Success(discount.ToResponse());
        }
    }
}
