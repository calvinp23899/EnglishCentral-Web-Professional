using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Commands.DeleteDiscount
{
    public class DeleteDiscountCommandHandler : IRequestHandler<DeleteDiscountCommand, Result<bool>>
    {
        private readonly IFinanceRepository<Discount> _repository;
        public DeleteDiscountCommandHandler(IFinanceRepository<Discount> repository) => _repository = repository;
        public async Task<Result<bool>> Handle(DeleteDiscountCommand request, CancellationToken ct)
        {
            var discount = await _repository.GetByIdAsync(request.Id, ct);
            if (discount is null) return Result<bool>.Failure("Discount is not found.", 404);
            discount.IsDeleted = true; discount.IsActive = false; discount.DeletedAt = DateTimeOffset.UtcNow; discount.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
