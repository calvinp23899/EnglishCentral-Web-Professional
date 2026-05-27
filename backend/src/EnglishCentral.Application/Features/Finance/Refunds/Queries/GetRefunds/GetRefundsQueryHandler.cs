using EnglishCentral.Application.Features.Finance.Refunds.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Refunds.Queries.GetRefunds
{
    public class GetRefundsQueryHandler : IRequestHandler<GetRefundsQuery, Result<PagedResult<RefundResponse>>>
    {
        private readonly IFinanceRepository<Refund> _repository;
        public GetRefundsQueryHandler(IFinanceRepository<Refund> repository) => _repository = repository;
        public async Task<Result<PagedResult<RefundResponse>>> Handle(GetRefundsQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.PaymentId.HasValue) query = query.Where(x => x.PaymentId == request.PaymentId.Value);
            if (request.EnrollmentId.HasValue) query = query.Where(x => x.EnrollmentId == request.EnrollmentId.Value);
            if (request.Status.HasValue) query = query.Where(x => x.Status == request.Status.Value);
            query = request.IsDescending ? query.OrderByDescending(x => x.RequestedAt) : query.OrderBy(x => x.RequestedAt);
            var total = await _repository.CountAsync(_ => query, ct);
            var rows = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            return Result<PagedResult<RefundResponse>>.Success(PagedResult<RefundResponse>.Create(rows.Select(x => x.ToResponse()).ToList(), request.Page, request.PageSize, total));
        }
    }
}
