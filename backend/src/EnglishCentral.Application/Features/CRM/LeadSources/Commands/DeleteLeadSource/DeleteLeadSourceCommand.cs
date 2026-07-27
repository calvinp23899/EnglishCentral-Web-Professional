using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Commands.DeleteLeadSource
{
    public record DeleteLeadSourceCommand(long Id) : IRequest<Result<bool>>;

    public class DeleteLeadSourceCommandValidator : AbstractValidator<DeleteLeadSourceCommand>
    {
        public DeleteLeadSourceCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
