using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadConversions.Queries.GetLeadConversions
{
    public class GetLeadConversionsQueryHandler : IRequestHandler<GetLeadConversionsQuery, Result<PagedResult<LeadConversionResponse>>>
    {
        private readonly ILeadConversionRepository _repository;

        public GetLeadConversionsQueryHandler(ILeadConversionRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<LeadConversionResponse>>> Handle(GetLeadConversionsQuery request, CancellationToken ct)
        {
            var result = await _repository.GetPagedWithDetailsAsync(
                request.Page,
                request.PageSize,
                request.LeadSourceId,
                request.ConvertedByUserId,
                request.ConvertedFrom,
                request.ConvertedTo,
                request.IsDescending,
                ct);

            return Result<PagedResult<LeadConversionResponse>>.Success(
                PagedResult<LeadConversionResponse>.Create(
                    result.Items.Select(x => x.ToResponse()).ToList(),
                    result.Page,
                    result.PageSize,
                    result.TotalItems));
        }
    }
}
