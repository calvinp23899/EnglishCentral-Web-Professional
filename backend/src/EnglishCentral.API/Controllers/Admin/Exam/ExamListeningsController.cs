using EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UploadExamAsset;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Exam
{
    [Route("api/admin/exam/listening")]
    [ApiController]
    public class ExamListeningsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ExamListeningsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("audio/upload")]
        [HasPermission(SystemPermissions.ExamCreate)]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(100 * 1024 * 1024)]
        public async Task<IActionResult> UploadAudio([FromForm] UploadExamListeningAudioRequest request, CancellationToken ct)
        {
            if (request.File is null)
                return BadRequest("Audio file is required.");

            if (Request.Form.Files.Count != 1)
                return BadRequest("Only one audio file can be uploaded per request.");

            await using var stream = request.File.OpenReadStream();
            var result = await _mediator.Send(new UploadExamAssetCommand(
                stream,
                request.File.FileName,
                request.File.ContentType,
                request.File.Length,
                EExamAssetType.Audio,
                request.DurationSeconds,
                request.MetadataJson), ct);

            return StatusCode(result.StatusCode, result);
        }
    }

    public class UploadExamListeningAudioRequest
    {
        public IFormFile? File { get; set; }

        public int? DurationSeconds { get; set; }

        public string? MetadataJson { get; set; }
    }
}
