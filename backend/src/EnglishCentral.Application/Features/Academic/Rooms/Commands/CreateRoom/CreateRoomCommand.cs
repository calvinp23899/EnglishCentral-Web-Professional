using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.CreateRoom
{
    public record CreateRoomCommand(
        string Code,
        string Name,
        int Capacity,
        string? Building,
        int? Floor,
        bool IsActive = true) : IRequest<Result<RoomResponse>>;

    public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
    {
        public CreateRoomCommandValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Capacity).GreaterThan(0);
            RuleFor(x => x.Building).MaximumLength(255);
        }
    }
}
