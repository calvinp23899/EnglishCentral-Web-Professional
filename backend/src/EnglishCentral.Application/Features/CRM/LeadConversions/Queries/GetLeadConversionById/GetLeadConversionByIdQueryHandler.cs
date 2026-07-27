using EnglishCentral.Application.Features.CRM.DTOs;
using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadConversions.Queries.GetLeadConversionById
{
    public class GetLeadConversionByIdQueryHandler : IRequestHandler<GetLeadConversionByIdQuery, Result<LeadConversionResponse>>
    {
        private readonly ILeadConversionRepository _repository;

        public GetLeadConversionByIdQueryHandler(ILeadConversionRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<LeadConversionResponse>> Handle(GetLeadConversionByIdQuery request, CancellationToken ct)
        {
            var conversion = await _repository.GetByIdWithDetailsAsync(request.Id, ct);

            return conversion is null
                ? Result<LeadConversionResponse>.Failure("Lead conversion is not found.", 404)
                : Result<LeadConversionResponse>.Success(conversion.ToResponse());
        }
    }
}
