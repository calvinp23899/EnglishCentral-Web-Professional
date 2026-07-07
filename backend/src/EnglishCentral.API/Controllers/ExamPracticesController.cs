using EnglishCentral.Application.Features.Exam.ExamAttempts.Commands.SubmitExamAttemptWithAnswers;
using EnglishCentral.Application.Features.Exam.ExamTemplates.Queries.GetExamTemplateById;
using EnglishCentral.Application.Features.Exam.ExamTemplates.Queries.GetExamTemplates;
using EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersionById;
using EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers
{
    public class ExamPracticesController : BaseController
    {
        private readonly IMediator _mediator;

        public ExamPracticesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("test/get-list")]
        public async Task<IActionResult> GetTestList([FromQuery] GetExamVersionsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }
        [HttpGet("test/{id:long}/get-by-id")]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetExamVersionByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("template/get-list")]
        public async Task<IActionResult> GetTemplateList([FromQuery] GetExamTemplatesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("template/{id:long}/get-by-id")]
        public async Task<IActionResult> GetTemplateById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetExamTemplateByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("submit-with-answers")]
        public async Task<IActionResult> SubmitWithAnswers(SubmitExamAttemptWithAnswersCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
