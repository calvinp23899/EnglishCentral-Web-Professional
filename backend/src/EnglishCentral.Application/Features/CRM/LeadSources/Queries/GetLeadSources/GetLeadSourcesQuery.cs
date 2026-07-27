using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Queries.GetLeadSources
{
    public record GetLeadSourcesQuery : IRequest<Result<PagedResult<LeadSourceResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public ELeadSourceChannel? Channel { get; init; }
        public bool? IsActive { get; init; }
        public bool IsDescending { get; init; } = true;
    }

    public class GetLeadSourcesQueryValidator : AbstractValidator<GetLeadSourcesQuery>
    {
        public GetLeadSourcesQueryValidator()
        {
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.Keyword).MaximumLength(255);
            RuleFor(x => x.Channel).IsInEnum().When(x => x.Channel.HasValue);
        }
    }
}
