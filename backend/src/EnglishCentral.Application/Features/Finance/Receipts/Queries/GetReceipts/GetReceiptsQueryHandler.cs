using EnglishCentral.Application.Features.Finance.Receipts.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Receipts.Queries.GetReceipts
{
    public class GetReceiptsQueryHandler : IRequestHandler<GetReceiptsQuery, Result<PagedResult<ReceiptResponse>>>
    {
        private readonly IFinanceRepository<Receipt> _repository;

        public GetReceiptsQueryHandler(IFinanceRepository<Receipt> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<ReceiptResponse>>> Handle(GetReceiptsQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.PaymentId.HasValue)
                query = query.Where(x => x.PaymentId == request.PaymentId.Value);

            query = request.IsDescending ? query.OrderByDescending(x => x.IssuedAt) : query.OrderBy(x => x.IssuedAt);
            var totalItems = await _repository.CountAsync(_ => query, ct);
            var receipts = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = receipts.Select(x => x.ToResponse()).ToList();

            return Result<PagedResult<ReceiptResponse>>.Success(PagedResult<ReceiptResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
