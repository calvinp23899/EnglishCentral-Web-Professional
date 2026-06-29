using EnglishCentral.Domain.Enums.Finance;
using FluentValidation;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.CreateBillingPolicy
{
    public class CreateBillingPolicyCommandValidator : AbstractValidator<CreateBillingPolicyCommand>
    {
        public CreateBillingPolicyCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.NumberOfInstallments).GreaterThan(1).When(x => x.Type == EBillingPolicyType.Installment);
            RuleFor(x => x.NumberOfInstallments).Null().When(x => x.Type == EBillingPolicyType.Monthly);
            RuleFor(x => x.Notes).MaximumLength(500);
        }
    }
}
