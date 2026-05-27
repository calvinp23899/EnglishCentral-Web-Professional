using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Commands.DeleteDiscount
{
    public record DeleteDiscountCommand(long Id) : IRequest<Result<bool>>;
    public class DeleteDiscountCommandValidator : AbstractValidator<DeleteDiscountCommand>
    {
        public DeleteDiscountCommandValidator() => RuleFor(x => x.Id).GreaterThan(0);
    }
}
