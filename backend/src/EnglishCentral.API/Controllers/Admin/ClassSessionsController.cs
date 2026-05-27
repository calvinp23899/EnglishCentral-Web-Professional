using EnglishCentral.Application.Features.Academic.ClassSessions.Commands.CreateClassSession;
using EnglishCentral.Application.Features.Academic.ClassSessions.Commands.DeleteClassSession;
using EnglishCentral.Application.Features.Academic.ClassSessions.Commands.UpdateClassSession;
using EnglishCentral.Application.Features.Academic.ClassSessions.Queries.GetClassSessionById;
using EnglishCentral.Application.Features.Academic.ClassSessions.Queries.GetClassSessions;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/academic/class-sessions")]
    [ApiController]
    public class ClassSessionsController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public ClassSessionsController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ClassSessionRead)]
        public async Task<IActionResult> GetList([FromQuery] GetClassSessionsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ClassSessionRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetClassSessionByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.ClassSessionCreate)]
        public async Task<IActionResult> Create(CreateClassSessionCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.ClassSessionUpdate)]
        public async Task<IActionResult> Update(long id, UpdateClassSessionCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.ClassSessionDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteClassSessionCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
