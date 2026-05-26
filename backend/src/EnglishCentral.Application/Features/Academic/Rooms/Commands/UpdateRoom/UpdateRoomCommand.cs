using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.UpdateRoom
{
    public record UpdateRoomCommand(
        long Id,
        string Code,
        string Name,
        int Capacity,
        string? Building,
        int? Floor,
        bool IsActive) : IRequest<Result<RoomResponse>>;

    public class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
    {
        public UpdateRoomCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Capacity).GreaterThan(0);
            RuleFor(x => x.Building).MaximumLength(255);
        }
    }
}
