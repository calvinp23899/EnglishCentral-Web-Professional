using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Queries.GetLeads
{
    public class GetLeadsQueryHandler : IRequestHandler<GetLeadsQuery, Result<PagedResult<LeadResponse>>>
    {
        private readonly ILeadRepository _repository;

        public GetLeadsQueryHandler(ILeadRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<LeadResponse>>> Handle(GetLeadsQuery request, CancellationToken ct)
        {
            var result = await _repository.GetPagedWithDetailsAsync(
                request.Page,
                request.PageSize,
                request.Keyword,
                request.Status,
                request.LostReason,
                request.LeadSourceId,
                request.AssignedToUserId,
                request.InterestedCourseId,
                request.CreatedFrom,
                request.CreatedTo,
                request.NextFollowUpFrom,
                request.NextFollowUpTo,
                request.IsDescending,
                ct);

            return Result<PagedResult<LeadResponse>>.Success(
                PagedResult<LeadResponse>.Create(
                    result.Items.Select(x => x.ToResponse()).ToList(),
                    result.Page,
                    result.PageSize,
                    result.TotalItems));
        }
    }
}
