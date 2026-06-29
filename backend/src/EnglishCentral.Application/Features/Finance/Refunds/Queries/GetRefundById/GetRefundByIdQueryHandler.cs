using EnglishCentral.Application.Features.Finance.Refunds.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Refunds.Queries.GetRefundById
{
    public class GetRefundByIdQueryHandler : IRequestHandler<GetRefundByIdQuery, Result<RefundResponse>>
    {
        private readonly IFinanceRepository<Refund> _repository;
        public GetRefundByIdQueryHandler(IFinanceRepository<Refund> repository) => _repository = repository;
        public async Task<Result<RefundResponse>> Handle(GetRefundByIdQuery request, CancellationToken ct)
        {
            var refund = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return refund is null ? Result<RefundResponse>.Failure("Refund is not found.", 404) : Result<RefundResponse>.Success(refund.ToResponse());
        }
    }
}
