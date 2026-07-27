using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadConversions.Queries.GetLeadConversionById
{
    public record GetLeadConversionByIdQuery(long Id) : IRequest<Result<LeadConversionResponse>>;

    public class GetLeadConversionByIdQueryValidator : AbstractValidator<GetLeadConversionByIdQuery>
    {
        public GetLeadConversionByIdQueryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
