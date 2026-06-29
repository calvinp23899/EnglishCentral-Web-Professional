using EnglishCentral.Application.Features.Academic.Attendances.Commands.CreateAttendance;
using EnglishCentral.Application.Features.Academic.Attendances.Commands.DeleteAttendance;
using EnglishCentral.Application.Features.Academic.Attendances.Commands.RecordBulkAttendance;
using EnglishCentral.Application.Features.Academic.Attendances.Commands.UpdateAttendance;
using EnglishCentral.Application.Features.Academic.Attendances.Queries.GetAttendanceById;
using EnglishCentral.Application.Features.Academic.Attendances.Queries.GetAttendances;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Academic
{
    [Route("api/admin/academic/attendances")]
    [ApiController]
    public class AttendancesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public AttendancesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.AttendanceRead)]
        public async Task<IActionResult> GetList([FromQuery] GetAttendancesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.AttendanceRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetAttendanceByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.AttendanceCreate)]
        public async Task<IActionResult> Create(CreateAttendanceCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.AttendanceUpdate)]
        public async Task<IActionResult> Update(long id, UpdateAttendanceCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("record-bulk")]
        [HasPermission(SystemPermissions.AttendanceCreate)]
        public async Task<IActionResult> RecordBulk(RecordBulkAttendanceCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.AttendanceDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteAttendanceCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
