using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.UpdateBillingPolicy
{
    public record UpdateBillingPolicyCommand(
        long Id,
        string Name,
        BillingPolicyType Type,
        int? NumberOfInstallments,
        bool IsDefault,
        bool IsActive,
        string? Notes) : IRequest<Result<BillingPolicyResponse>>;

    public class UpdateBillingPolicyCommandValidator : AbstractValidator<UpdateBillingPolicyCommand>
    {
        public UpdateBillingPolicyCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.NumberOfInstallments).GreaterThan(1).When(x => x.Type == BillingPolicyType.Installment);
            RuleFor(x => x.NumberOfInstallments).Null().When(x => x.Type == BillingPolicyType.Monthly || x.Type == BillingPolicyType.Custom);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
