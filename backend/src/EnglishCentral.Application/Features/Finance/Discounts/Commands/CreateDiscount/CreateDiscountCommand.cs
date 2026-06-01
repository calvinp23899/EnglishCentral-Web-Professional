using EnglishCentral.Application.Features.Finance.Discounts.DTOs;
using EnglishCentral.Domain.Enums.Finance;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.Discounts.Commands.CreateDiscount
{
    public record CreateDiscountCommand(string Code, string Name, EDiscountType Type, decimal Value, DateOnly? ValidFrom, DateOnly? ValidTo, bool IsActive, string? Description) : IRequest<Result<DiscountResponse>>;

    public class CreateDiscountCommandValidator : AbstractValidator<CreateDiscountCommand>
    {
        public CreateDiscountCommandValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.Value).GreaterThan(0);
            RuleFor(x => x.Value).LessThanOrEqualTo(100).When(x => x.Type == EDiscountType.Percentage);
            RuleFor(x => x.ValidTo).GreaterThanOrEqualTo(x => x.ValidFrom).When(x => x.ValidFrom.HasValue && x.ValidTo.HasValue);
            RuleFor(x => x.Description).MaximumLength(2000);
        }
    }
}
