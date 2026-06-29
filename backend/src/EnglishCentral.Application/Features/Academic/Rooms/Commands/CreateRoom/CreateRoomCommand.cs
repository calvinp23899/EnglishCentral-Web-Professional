using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.CreateRoom
{
    public record CreateRoomCommand(
        string Name,
        int Capacity,
        string? Building,
        int? Floor,
        bool IsActive = true) : IRequest<Result<RoomResponse>>;
}
