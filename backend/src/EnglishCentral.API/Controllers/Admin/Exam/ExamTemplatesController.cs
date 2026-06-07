using EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.CreateExamTemplate;
using EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.DeleteExamTemplate;
using EnglishCentral.Application.Features.Exam.ExamTemplates.Commands.UpdateExamTemplate;
using EnglishCentral.Application.Features.Exam.ExamTemplates.Queries.GetExamTemplateById;
using EnglishCentral.Application.Features.Exam.ExamTemplates.Queries.GetExamTemplates;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Exam
{
    [Route("api/admin/exam/templates")]
    [ApiController]
    public class ExamTemplatesController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ExamTemplatesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetList([FromQuery] GetExamTemplatesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetExamTemplateByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.ExamCreate)]
        public async Task<IActionResult> Create(CreateExamTemplateCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.ExamUpdate)]
        public async Task<IActionResult> Update(long id, UpdateExamTemplateCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.ExamDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteExamTemplateCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
