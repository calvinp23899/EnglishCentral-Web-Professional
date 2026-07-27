using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Queries.GetLeadSourceById
{
    public record GetLeadSourceByIdQuery(long Id) : IRequest<Result<LeadSourceResponse>>;

    public class GetLeadSourceByIdQueryValidator : AbstractValidator<GetLeadSourceByIdQuery>
    {
        public GetLeadSourceByIdQueryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
