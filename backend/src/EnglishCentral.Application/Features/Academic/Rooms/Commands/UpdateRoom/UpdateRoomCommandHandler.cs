using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.UpdateRoom
{
    public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, Result<RoomResponse>>
    {
        private readonly IAcademicRepository<Room> _repository;

        public UpdateRoomCommandHandler(IAcademicRepository<Room> repository)
        {
            _repository = repository;
        }

        public async Task<Result<RoomResponse>> Handle(UpdateRoomCommand request, CancellationToken ct)
        {
            var room = await _repository.GetByIdAsync(request.Id, ct);
            if (room is null)
                return Result<RoomResponse>.Failure("Room is not found.", 404);

            var code = request.Code.Trim();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Code == code, ct))
                return Result<RoomResponse>.Failure("Room code already exists.", 409);

            room.Code = code;
            room.Name = request.Name.Trim();
            room.Capacity = request.Capacity;
            room.Building = request.Building?.Trim();
            room.Floor = request.Floor;
            room.IsActive = request.IsActive;
            room.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<RoomResponse>.Success(room.ToResponse());
        }
    }
}
