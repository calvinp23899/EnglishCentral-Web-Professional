using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Queries.GetLeads
{
    public record GetLeadsQuery : IRequest<Result<PagedResult<LeadResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public ELeadStatus? Status { get; init; }
        public ELeadLostReason? LostReason { get; init; }
        public long? LeadSourceId { get; init; }
        public long? AssignedToUserId { get; init; }
        public long? InterestedCourseId { get; init; }
        public DateTimeOffset? CreatedFrom { get; init; }
        public DateTimeOffset? CreatedTo { get; init; }
        public DateTimeOffset? NextFollowUpFrom { get; init; }
        public DateTimeOffset? NextFollowUpTo { get; init; }
        public bool IsDescending { get; init; } = true;
    }

    public class GetLeadsQueryValidator : AbstractValidator<GetLeadsQuery>
    {
        public GetLeadsQueryValidator()
        {
            RuleFor(x => x.Page).GreaterThan(0);
            RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
            RuleFor(x => x.Keyword).MaximumLength(255);
            RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
            RuleFor(x => x.LostReason).IsInEnum().When(x => x.LostReason.HasValue);
            RuleFor(x => x.LeadSourceId).GreaterThan(0).When(x => x.LeadSourceId.HasValue);
            RuleFor(x => x.AssignedToUserId).GreaterThan(0).When(x => x.AssignedToUserId.HasValue);
            RuleFor(x => x.InterestedCourseId).GreaterThan(0).When(x => x.InterestedCourseId.HasValue);
        }
    }
}
