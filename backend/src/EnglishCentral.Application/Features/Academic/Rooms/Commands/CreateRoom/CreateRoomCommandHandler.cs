using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Commands.CreateRoom
{
    public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, Result<RoomResponse>>
    {
        private readonly IAcademicRepository<Room> _repository;
        private readonly ICodeGenerator _codeGenerator;

        public CreateRoomCommandHandler(IAcademicRepository<Room> repository, ICodeGenerator codeGenerator)
        {
            _repository = repository;
            _codeGenerator = codeGenerator;
        }

        public async Task<Result<RoomResponse>> Handle(CreateRoomCommand request, CancellationToken ct)
        {
            var code = $"ROOM-{_codeGenerator.GenerateCode()}";
            if (await _repository.ExistsAsync(x => x.Code == code, ct))
                return Result<RoomResponse>.Failure("Room code already exists.", 409);

            var room = new Room
            {
                Code = code,
                Name = request.Name.Trim(),
                Capacity = request.Capacity,
                Building = request.Building?.Trim(),
                Floor = request.Floor,
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(room, ct);
            return Result<RoomResponse>.Success(room.ToResponse(), 201);
        }
    }
}
