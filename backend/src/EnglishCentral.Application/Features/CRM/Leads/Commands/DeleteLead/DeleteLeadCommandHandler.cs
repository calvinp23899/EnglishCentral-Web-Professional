using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.Leads.Commands.DeleteLead
{
    public class DeleteLeadCommandHandler : IRequestHandler<DeleteLeadCommand, Result<bool>>
    {
        private readonly ILeadRepository _repository;

        public DeleteLeadCommandHandler(ILeadRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteLeadCommand request, CancellationToken ct)
        {
            var lead = await _repository.GetByIdAsync(request.Id, ct);
            if (lead is null)
                return Result<bool>.Failure("Lead is not found.", 404);

            _repository.SoftDelete(lead);

            return Result<bool>.Success(true);
        }
    }
}
