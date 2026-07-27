using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.DeleteLead
{
    public record DeleteLeadCommand(long Id) : IRequest<Result<bool>>;

    public class DeleteLeadCommandValidator : AbstractValidator<DeleteLeadCommand>
    {
        public DeleteLeadCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
