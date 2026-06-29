using EnglishCentral.Application.Features.Finance.Receipts.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Receipts.Queries.GetReceiptById
{
    public record GetReceiptByIdQuery(long Id) : IRequest<Result<ReceiptResponse>>;

    public class GetReceiptByIdQueryValidator : AbstractValidator<GetReceiptByIdQuery>
    {
        public GetReceiptByIdQueryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
