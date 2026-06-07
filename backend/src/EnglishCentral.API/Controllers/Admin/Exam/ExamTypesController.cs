using EnglishCentral.Application.Features.Exam.ExamTypes.Commands.CreateExamType;
using EnglishCentral.Application.Features.Exam.ExamTypes.Commands.DeleteExamType;
using EnglishCentral.Application.Features.Exam.ExamTypes.Commands.UpdateExamType;
using EnglishCentral.Application.Features.Exam.ExamTypes.Queries.GetExamTypeById;
using EnglishCentral.Application.Features.Exam.ExamTypes.Queries.GetExamTypes;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Exam
{
    [Route("api/admin/exam/types")]
    [ApiController]
    public class ExamTypesController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ExamTypesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetList([FromQuery] GetExamTypesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetExamTypeByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("insert")]
        [HasPermission(SystemPermissions.ExamCreate)]
        public async Task<IActionResult> Create(CreateExamTypeCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.ExamUpdate)]
        public async Task<IActionResult> Update(long id, UpdateExamTypeCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.ExamDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteExamTypeCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
