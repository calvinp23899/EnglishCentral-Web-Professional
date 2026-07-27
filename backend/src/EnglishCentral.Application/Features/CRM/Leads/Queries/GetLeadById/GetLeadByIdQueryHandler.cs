using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Queries.GetLeadById
{
    public class GetLeadByIdQueryHandler : IRequestHandler<GetLeadByIdQuery, Result<LeadResponse>>
    {
        private readonly ILeadRepository _repository;

        public GetLeadByIdQueryHandler(ILeadRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<LeadResponse>> Handle(GetLeadByIdQuery request, CancellationToken ct)
        {
            var lead = await _repository.GetByIdWithDetailsAsync(request.Id, ct);

            return lead is null
                ? Result<LeadResponse>.Failure("Lead is not found.", 404)
                : Result<LeadResponse>.Success(lead.ToResponse());
        }
    }
}
