using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.DeleteRoom
{
    public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand, Result<bool>>
    {
        private readonly IAcademicRepository<Room> _repository;

        public DeleteRoomCommandHandler(IAcademicRepository<Room> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteRoomCommand request, CancellationToken ct)
        {
            var room = await _repository.GetByIdAsync(request.Id, ct);
            if (room is null)
                return Result<bool>.Failure("Room is not found.", 404);

            room.IsDeleted = true;
            room.DeletedAt = DateTimeOffset.UtcNow;
            room.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
