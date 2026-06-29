using EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SaveExamResponse;
using EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.StartExamAttempt;
using EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttempt;
using EnglishCentral.Application.Features.Exam.ExamAttempts.Queries.GetExamAttemptById;
using EnglishCentral.Application.Features.Exam.ExamAttempts.Queries.GetExamAttempts;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Exam
{
    [Route("api/admin/exam/attempts")]
    [ApiController]
    public class ExamAttemptsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ExamAttemptsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetList([FromQuery] GetExamAttemptsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetExamAttemptByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("start")]
        [HasPermission(SystemPermissions.ExamCreate)]
        public async Task<IActionResult> Start(StartExamAttemptCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{attemptId:long}/responses/save")]
        [HasPermission(SystemPermissions.ExamUpdate)]
        public async Task<IActionResult> SaveResponse(long attemptId, SaveExamResponseCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { AttemptId = attemptId }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("{attemptId:long}/submit")]
        [HasPermission(SystemPermissions.ExamUpdate)]
        public async Task<IActionResult> Submit(long attemptId, CancellationToken ct)
        {
            var result = await _mediator.Send(new SubmitExamAttemptCommand(attemptId), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
