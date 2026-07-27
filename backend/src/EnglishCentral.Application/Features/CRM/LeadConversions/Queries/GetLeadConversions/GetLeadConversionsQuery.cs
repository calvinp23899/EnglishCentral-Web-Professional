using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadConversions.Queries.GetLeadConversions
{
    public record GetLeadConversionsQuery : IRequest<Result<PagedResult<LeadConversionResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public long? LeadSourceId { get; init; }
        public long? ConvertedByUserId { get; init; }
        public DateTimeOffset? ConvertedFrom { get; init; }
        public DateTimeOffset? ConvertedTo { get; init; }
        public bool IsDescending { get; init; } = true;
    }

    public class GetLeadConversionsQueryValidator : AbstractValidator<GetLeadConversionsQuery>
    {
        public GetLeadConversionsQueryValidator()
        {
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.LeadSourceId).GreaterThan(0).When(x => x.LeadSourceId.HasValue);
            RuleFor(x => x.ConvertedByUserId).GreaterThan(0).When(x => x.ConvertedByUserId.HasValue);
        }
    }
}
