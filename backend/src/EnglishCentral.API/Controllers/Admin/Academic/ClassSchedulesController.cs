using EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.CreateClassSchedule;
using EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.DeleteClassSchedule;
using EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.UpdateClassSchedule;
using EnglishCentral.Application.Features.Academic.ClassSchedules.Queries.GetClassScheduleById;
using EnglishCentral.Application.Features.Academic.ClassSchedules.Queries.GetClassSchedules;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Academic
{
    [Route("api/admin/academic/class-schedules")]
    [ApiController]
    public class ClassSchedulesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public ClassSchedulesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ClassScheduleRead)]
        public async Task<IActionResult> GetList([FromQuery] GetClassSchedulesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ClassScheduleRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetClassScheduleByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.ClassScheduleCreate)]
        public async Task<IActionResult> Create(CreateClassScheduleCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.ClassScheduleUpdate)]
        public async Task<IActionResult> Update(long id, UpdateClassScheduleCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.ClassScheduleDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteClassScheduleCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
