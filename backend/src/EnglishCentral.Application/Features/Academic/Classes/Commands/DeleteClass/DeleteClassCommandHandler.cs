using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Classes.Commands.DeleteClass
{
    public class DeleteClassCommandHandler : IRequestHandler<DeleteClassCommand, Result<bool>>
    {
        private readonly IAcademicRepository<AcademicClass> _repository;

        public DeleteClassCommandHandler(IAcademicRepository<AcademicClass> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteClassCommand request, CancellationToken ct)
        {
            var classroom = await _repository.GetByIdAsync(request.Id, ct);
            if (classroom is null)
                return Result<bool>.Failure("Class is not found.", 404);

            classroom.IsDeleted = true;
            classroom.DeletedAt = DateTimeOffset.UtcNow;
            classroom.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
