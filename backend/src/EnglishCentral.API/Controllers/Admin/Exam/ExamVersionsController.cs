using EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CreateExamVersion;
using EnglishCentral.Application.Features.Exam.ExamVersions.Commands.PublishExamVersion;
using EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersionById;
using EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersions;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Exam
{
    [Route("api/admin/exam/versions")]
    [ApiController]
    public class ExamVersionsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ExamVersionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetList([FromQuery] GetExamVersionsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetExamVersionByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.ExamCreate)]
        public async Task<IActionResult> Create(CreateExamVersionCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{id:long}/publish")]
        [HasPermission(SystemPermissions.ExamUpdate)]
        public async Task<IActionResult> Publish(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new PublishExamVersionCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
