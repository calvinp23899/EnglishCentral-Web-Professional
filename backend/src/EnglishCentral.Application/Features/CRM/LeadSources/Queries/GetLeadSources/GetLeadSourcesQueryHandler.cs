using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Queries.GetLeadSources
{
    public class GetLeadSourcesQueryHandler : IRequestHandler<GetLeadSourcesQuery, Result<PagedResult<LeadSourceResponse>>>
    {
        private readonly ILeadSourceRepository _repository;

        public GetLeadSourcesQueryHandler(ILeadSourceRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<LeadSourceResponse>>> Handle(GetLeadSourcesQuery request, CancellationToken ct)
        {
            var keyword = request.Keyword?.Trim().ToLower();
            var result = await _repository.GetPagedAsync(
                request.Page,
                request.PageSize,
                x =>
                    (string.IsNullOrWhiteSpace(keyword)
                        || x.Code.ToLower().Contains(keyword)
                        || x.Name.ToLower().Contains(keyword)
                        || (x.CampaignName != null && x.CampaignName.ToLower().Contains(keyword)))
                    && (!request.Channel.HasValue || x.Channel == request.Channel.Value)
                    && (!request.IsActive.HasValue || x.IsActive == request.IsActive.Value),
                ct,
                orderBy: query => request.IsDescending
                    ? query.OrderByDescending(x => x.CreatedAt)
                    : query.OrderBy(x => x.CreatedAt));

            return Result<PagedResult<LeadSourceResponse>>.Success(
                PagedResult<LeadSourceResponse>.Create(
                    result.Items.Select(x => x.ToResponse()).ToList(),
                    result.Page,
                    result.PageSize,
                    result.TotalItems));
        }
    }
}
