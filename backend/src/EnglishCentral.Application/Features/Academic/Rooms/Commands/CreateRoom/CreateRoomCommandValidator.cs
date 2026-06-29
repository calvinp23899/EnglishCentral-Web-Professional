using FluentValidation;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.CreateRoom
{
    public class CreateRoomCommandValidator : AbstractValidator<CreateRoomCommand>
    {
        public CreateRoomCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Capacity).GreaterThan(0);
            RuleFor(x => x.Building).MaximumLength(255);
        }
    }
}
