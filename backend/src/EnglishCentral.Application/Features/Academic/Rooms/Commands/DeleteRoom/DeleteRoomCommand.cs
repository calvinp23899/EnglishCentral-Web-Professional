using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.DeleteRoom
{
    public record DeleteRoomCommand(long Id) : IRequest<Result<bool>>;
}
