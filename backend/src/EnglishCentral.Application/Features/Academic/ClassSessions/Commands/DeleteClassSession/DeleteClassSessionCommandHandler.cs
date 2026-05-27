using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Commands.DeleteClassSession
{
    public class DeleteClassSessionCommandHandler : IRequestHandler<DeleteClassSessionCommand, Result<bool>>
    {
        private readonly IAcademicRepository<ClassSession> _repository;

        public DeleteClassSessionCommandHandler(IAcademicRepository<ClassSession> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteClassSessionCommand request, CancellationToken ct)
        {
            var session = await _repository.GetByIdAsync(request.Id, ct);
            if (session is null)
                return Result<bool>.Failure("Class session is not found.", 404);

            session.IsDeleted = true;
            session.DeletedAt = DateTimeOffset.UtcNow;
            session.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
