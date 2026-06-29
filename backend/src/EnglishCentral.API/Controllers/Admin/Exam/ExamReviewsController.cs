using EnglishCentral.Application.Features.Exam.ExamReviews.Commands.ReviewExamAttempt;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Exam
{
    [Route("api/admin/exam/reviews")]
    [ApiController]
    public class ExamReviewsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ExamReviewsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("attempts/{attemptId:long}/review")]
        [HasPermission(SystemPermissions.ExamReview)]
        public async Task<IActionResult> ReviewAttempt(long attemptId, ReviewExamAttemptCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { AttemptId = attemptId }, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
