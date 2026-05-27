using EnglishCentral.Application.Features.Academic.Enrollments.Commands.CreateEnrollment;
using EnglishCentral.Application.Features.Academic.Enrollments.Commands.DeleteEnrollment;
using EnglishCentral.Application.Features.Academic.Enrollments.Commands.UpdateEnrollment;
using EnglishCentral.Application.Features.Academic.Enrollments.Queries.GetEnrollmentById;
using EnglishCentral.Application.Features.Academic.Enrollments.Queries.GetEnrollments;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    [Route("api/admin/academic/enrollments")]
    [ApiController]
    public class EnrollmentsController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public EnrollmentsController(IMediator mediator) => _mediator = mediator;

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.EnrollmentRead)]
        public async Task<IActionResult> GetList([FromQuery] GetEnrollmentsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.EnrollmentRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetEnrollmentByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.EnrollmentCreate)]
        public async Task<IActionResult> Create(CreateEnrollmentCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.EnrollmentUpdate)]
        public async Task<IActionResult> Update(long id, UpdateEnrollmentCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.EnrollmentDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteEnrollmentCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
