using EnglishCentral.Application.Features.Finance.Discounts.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Commands.CreateDiscount
{
    public class CreateDiscountCommandHandler : IRequestHandler<CreateDiscountCommand, Result<DiscountResponse>>
    {
        private readonly IFinanceRepository<Discount> _repository;
        public CreateDiscountCommandHandler(IFinanceRepository<Discount> repository) => _repository = repository;

        public async Task<Result<DiscountResponse>> Handle(CreateDiscountCommand request, CancellationToken ct)
        {
            var code = request.Code.Trim();
            if (await _repository.ExistsAsync(x => x.Code == code, ct))
                return Result<DiscountResponse>.Failure("Discount code already exists.", 409);

            var discount = new Discount
            {
                Code = code,
                Name = code,
                Type = request.Type,
                Value = request.Value,
                ValidFrom = request.ValidFrom,
                ValidTo = request.ValidTo,
                IsActive = request.IsActive,
                MaxUsageCount = request.MaxUsageCount,
                MaxUsagePerStudent = request.MaxUsagePerStudent,
                Description = request.Description?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };
            await _repository.AddAsync(discount, ct);
            return Result<DiscountResponse>.Success(discount.ToResponse(), 201);
        }
    }
}
