using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Queries.GetRoomById
{
    public record GetRoomByIdQuery(long Id) : IRequest<Result<RoomResponse>>;
}
