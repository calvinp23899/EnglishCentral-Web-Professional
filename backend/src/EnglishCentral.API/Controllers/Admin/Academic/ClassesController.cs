using EnglishCentral.Application.Features.Academic.Classes.Commands.CreateClass;
using EnglishCentral.Application.Features.Academic.Classes.Commands.DeleteClass;
using EnglishCentral.Application.Features.Academic.Classes.Commands.UpdateClass;
using EnglishCentral.Application.Features.Academic.Classes.Queries.GetClassById;
using EnglishCentral.Application.Features.Academic.Classes.Queries.GetClassStudents;
using EnglishCentral.Application.Features.Academic.Classes.Queries.GetClasses;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Academic
{
    [Route("api/admin/academic/classes")]
    [ApiController]
    public class ClassesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public ClassesController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ClassRead)]
        public async Task<IActionResult> GetList([FromQuery] GetClassesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("get-class-students")]
        [HasPermission(SystemPermissions.ClassRead)]
        public async Task<IActionResult> GetClassStudents([FromQuery] long classId, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetClassStudentsQuery(classId), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ClassRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetClassByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.ClassCreate)]
        public async Task<IActionResult> Create(CreateClassCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.ClassUpdate)]
        public async Task<IActionResult> Update(long id, UpdateClassCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.ClassDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteClassCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
