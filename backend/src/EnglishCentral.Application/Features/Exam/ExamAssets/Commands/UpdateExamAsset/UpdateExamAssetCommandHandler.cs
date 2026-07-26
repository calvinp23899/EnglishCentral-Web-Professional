using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.UpdateExamAsset
{
    public class UpdateExamAssetCommandHandler : IRequestHandler<UpdateExamAssetCommand, Result<ExamAssetResponse>>
    {
        private readonly IExamRepository<ExamAsset> _repository;

        public UpdateExamAssetCommandHandler(IExamRepository<ExamAsset> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ExamAssetResponse>> Handle(UpdateExamAssetCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id, ct);
            if (entity is null)
                return Result<ExamAssetResponse>.Failure("Exam asset is not found.", 404);

            var metadataResult = ExamAssetMetadataHelper.Normalize(request.MetadataJson);
            if (!metadataResult.IsSuccess)
                return Result<ExamAssetResponse>.Failure(metadataResult.Error ?? "MetadataJson is invalid.", 400);

            if (!string.IsNullOrWhiteSpace(request.OriginalFileName))
                entity.OriginalFileName = request.OriginalFileName.Trim();

            entity.Status = request.Status;
            entity.DurationSeconds = request.DurationSeconds;
            entity.MetadataJson = metadataResult.NormalizedJson;
            entity.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<ExamAssetResponse>.Success(entity.ToResponse());
        }
    }
}
