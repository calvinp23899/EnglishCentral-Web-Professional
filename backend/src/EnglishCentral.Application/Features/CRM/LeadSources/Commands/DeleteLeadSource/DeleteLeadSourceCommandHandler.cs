using EnglishCentral.Application.Interfaces.CRM;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.CRM.LeadSources.Commands.DeleteLeadSource
{
    public class DeleteLeadSourceCommandHandler : IRequestHandler<DeleteLeadSourceCommand, Result<bool>>
    {
        private readonly ILeadSourceRepository _repository;

        public DeleteLeadSourceCommandHandler(ILeadSourceRepository repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteLeadSourceCommand request, CancellationToken ct)
        {
            var source = await _repository.GetByIdAsync(request.Id, ct);
            if (source is null)
                return Result<bool>.Failure("Lead source is not found.", 404);

            _repository.SoftDelete(source);

            return Result<bool>.Success(true);
        }
    }
}
