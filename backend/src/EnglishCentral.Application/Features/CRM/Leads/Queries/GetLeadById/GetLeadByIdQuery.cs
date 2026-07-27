using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Queries.GetLeadById
{
    public record GetLeadByIdQuery(long Id) : IRequest<Result<LeadResponse>>;

    public class GetLeadByIdQueryValidator : AbstractValidator<GetLeadByIdQuery>
    {
        public GetLeadByIdQueryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
