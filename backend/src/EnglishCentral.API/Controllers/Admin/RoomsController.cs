using EnglishCentral.Application.Features.Academic.Rooms.Commands.CreateRoom;
using EnglishCentral.Application.Features.Academic.Rooms.Commands.DeleteRoom;
using EnglishCentral.Application.Features.Academic.Rooms.Commands.UpdateRoom;
using EnglishCentral.Application.Features.Academic.Rooms.Queries.GetRoomById;
using EnglishCentral.Application.Features.Academic.Rooms.Queries.GetRooms;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/academic/rooms")]
    [ApiController]
    public class RoomsController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public RoomsController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.RoomRead)]
        public async Task<IActionResult> GetList([FromQuery] GetRoomsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.RoomRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetRoomByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.RoomCreate)]
        public async Task<IActionResult> Create(CreateRoomCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.RoomUpdate)]
        public async Task<IActionResult> Update(long id, UpdateRoomCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.RoomDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteRoomCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
