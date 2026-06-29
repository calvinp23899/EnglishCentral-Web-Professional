using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Queries.GetRoomById
{
    public class GetRoomByIdQueryHandler : IRequestHandler<GetRoomByIdQuery, Result<RoomResponse>>
    {
        private readonly IAcademicRepository<Room> _repository;

        public GetRoomByIdQueryHandler(IAcademicRepository<Room> repository)
        {
            _repository = repository;
        }

        public async Task<Result<RoomResponse>> Handle(GetRoomByIdQuery request, CancellationToken ct)
        {
            var room = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return room is null
                ? Result<RoomResponse>.Failure("Room is not found.", 404)
                : Result<RoomResponse>.Success(room.ToResponse());
        }
    }
}
