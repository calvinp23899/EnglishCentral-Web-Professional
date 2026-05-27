using EnglishCentral.Application.Features.Finance.Discounts.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Queries.GetDiscountById
{
    public class GetDiscountByIdQueryHandler : IRequestHandler<GetDiscountByIdQuery, Result<DiscountResponse>>
    {
        private readonly IFinanceRepository<Discount> _repository;
        public GetDiscountByIdQueryHandler(IFinanceRepository<Discount> repository) => _repository = repository;
        public async Task<Result<DiscountResponse>> Handle(GetDiscountByIdQuery request, CancellationToken ct)
        {
            var discount = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return discount is null ? Result<DiscountResponse>.Failure("Discount is not found.", 404) : Result<DiscountResponse>.Success(discount.ToResponse());
        }
    }
}
