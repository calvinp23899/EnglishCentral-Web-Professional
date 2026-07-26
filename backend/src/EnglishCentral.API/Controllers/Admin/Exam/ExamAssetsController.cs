using EnglishCentral.Application.Features.Exam.ExamAssets.Commands.DeleteExamAsset;
using EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UpdateExamAsset;
using EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UploadExamAsset;
using EnglishCentral.Application.Features.Exam.ExamAssets.Queries.GetExamAssetById;
using EnglishCentral.Application.Features.Exam.ExamAssets.Queries.GetExamAssets;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Exam
{
    [Route("api/admin/exam/assets")]
    [ApiController]
    public class ExamAssetsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public ExamAssetsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("upload")]
        [HasPermission(SystemPermissions.ExamCreate)]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(100 * 1024 * 1024)]
        public async Task<IActionResult> Upload([FromForm] UploadExamAssetRequest request, CancellationToken ct)
        {
            if (request.File is null)
                return BadRequest("Asset file is required.");

            if (Request.Form.Files.Count != 1)
                return BadRequest("Only one asset file can be uploaded per request.");

            await using var stream = request.File.OpenReadStream();
            var result = await _mediator.Send(new UploadExamAssetCommand(
                stream,
                request.File.FileName,
                request.File.ContentType,
                request.File.Length,
                request.AssetType,
                request.DurationSeconds,
                request.MetadataJson), ct);

            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetList([FromQuery] GetExamAssetsQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.ExamRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetExamAssetByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:long}/update")]
        [HasPermission(SystemPermissions.ExamUpdate)]
        public async Task<IActionResult> Update(long id, UpdateExamAssetCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { Id = id }, ct);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:long}/delete")]
        [HasPermission(SystemPermissions.ExamDelete)]
        public async Task<IActionResult> Delete(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteExamAssetCommand(id), ct);
            return StatusCode(result.StatusCode, result);
        }
    }

    public class UploadExamAssetRequest
    {
        public IFormFile? File { get; set; }

        public EExamAssetType AssetType { get; set; } = EExamAssetType.Audio;

        public int? DurationSeconds { get; set; }

        public string? MetadataJson { get; set; }
    }
}
