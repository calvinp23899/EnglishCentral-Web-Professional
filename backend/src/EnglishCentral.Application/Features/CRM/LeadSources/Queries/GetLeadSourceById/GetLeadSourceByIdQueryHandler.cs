using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Queries.GetLeadSourceById
{
    public class GetLeadSourceByIdQueryHandler : IRequestHandler<GetLeadSourceByIdQuery, Result<LeadSourceResponse>>
    {
        private readonly ILeadSourceRepository _repository;

        public GetLeadSourceByIdQueryHandler(ILeadSourceRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<LeadSourceResponse>> Handle(GetLeadSourceByIdQuery request, CancellationToken ct)
        {
            var source = await _repository.GetByIdAsync(request.Id, ct, asNoTracking: true);

            return source is null
                ? Result<LeadSourceResponse>.Failure("Lead source is not found.", 404)
                : Result<LeadSourceResponse>.Success(source.ToResponse());
        }
    }
}
