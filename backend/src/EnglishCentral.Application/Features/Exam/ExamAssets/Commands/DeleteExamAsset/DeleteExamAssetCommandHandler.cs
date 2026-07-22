using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Application.Interfaces.Storage;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamAssets.Commands.DeleteExamAsset
{
    public class DeleteExamAssetCommandHandler : IRequestHandler<DeleteExamAssetCommand, Result<bool>>
    {
        private readonly IExamRepository<ExamAsset> _repository;
        private readonly IExamRepository<ExamStimulus> _stimulusRepository;
        private readonly ICloudflareR2StorageService _storageService;

        public DeleteExamAssetCommandHandler(
            IExamRepository<ExamAsset> repository,
            IExamRepository<ExamStimulus> stimulusRepository,
            ICloudflareR2StorageService storageService)
        {
            _repository = repository;
            _stimulusRepository = stimulusRepository;
            _storageService = storageService;
        }

        public async Task<Result<bool>> Handle(DeleteExamAssetCommand request, CancellationToken ct)
        {
            var entity = await _repository.GetByIdAsync(request.Id, ct);
            if (entity is null)
                return Result<bool>.Failure("Exam asset is not found.", 404);

            if (await _stimulusRepository.ExistsAsync(x => x.ExamAssetId == request.Id, ct))
                return Result<bool>.Failure("Exam asset is being used by an exam stimulus.", 409);

            await _storageService.DeleteAsync(entity.ObjectKey, ct);

            entity.Status = EExamAssetStatus.Deleted;
            entity.IsDeleted = true;
            entity.DeletedAt = DateTimeOffset.UtcNow;

            return Result<bool>.Success(true);
        }
    }
}
