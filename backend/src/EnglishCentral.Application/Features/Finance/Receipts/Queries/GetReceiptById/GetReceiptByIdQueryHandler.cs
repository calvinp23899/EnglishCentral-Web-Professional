using EnglishCentral.Application.Features.Finance.Receipts.DTOs;
using EnglishCentral.Application.Interfaces.Finance;
using EnglishCentral.Domain.Entities.Finance;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Receipts.Queries.GetReceiptById
{
    public class GetReceiptByIdQueryHandler : IRequestHandler<GetReceiptByIdQuery, Result<ReceiptResponse>>
    {
        private readonly IFinanceRepository<Receipt> _repository;

        public GetReceiptByIdQueryHandler(IFinanceRepository<Receipt> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ReceiptResponse>> Handle(GetReceiptByIdQuery request, CancellationToken ct)
        {
            var receipt = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return receipt is null
                ? Result<ReceiptResponse>.Failure("Receipt is not found.", 404)
                : Result<ReceiptResponse>.Success(receipt.ToResponse());
        }
    }
}
