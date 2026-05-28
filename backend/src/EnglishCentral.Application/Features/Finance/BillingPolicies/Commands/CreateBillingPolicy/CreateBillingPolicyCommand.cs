using EnglishCentral.Application.Features.Finance.BillingPolicies.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Finance.BillingPolicies.Commands.CreateBillingPolicy
{
    public record CreateBillingPolicyCommand(
        string Name,
        EBillingPolicyType Type,
        int? NumberOfInstallments,
        bool IsDefault,
        bool IsActive,
        string? Notes) : IRequest<Result<BillingPolicyResponse>>;

    public class CreateBillingPolicyCommandValidator : AbstractValidator<CreateBillingPolicyCommand>
    {
        public CreateBillingPolicyCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Type).IsInEnum();
            RuleFor(x => x.NumberOfInstallments).GreaterThan(1).When(x => x.Type == EBillingPolicyType.Installment);
            RuleFor(x => x.NumberOfInstallments).Null().When(x => x.Type == EBillingPolicyType.Monthly || x.Type == EBillingPolicyType.Custom);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
