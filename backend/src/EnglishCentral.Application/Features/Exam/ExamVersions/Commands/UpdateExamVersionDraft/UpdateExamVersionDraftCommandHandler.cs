using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Features.Exam.ExamVersions.Services;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.UpdateExamVersionDraft
{
    public class UpdateExamVersionDraftCommandHandler : IRequestHandler<UpdateExamVersionDraftCommand, Result<ExamVersionResponse>>
    {
        private readonly IExamRepository<ExamVersion> _repository;
        private readonly IExamVersionDraftRepository _draftRepository;
        private readonly IExamReadRepository _readRepository;

        public UpdateExamVersionDraftCommandHandler(
            IExamRepository<ExamVersion> repository,
            IExamVersionDraftRepository draftRepository,
            IExamReadRepository readRepository)
        {
            _repository = repository;
            _draftRepository = draftRepository;
            _readRepository = readRepository;
        }

        public async Task<Result<ExamVersionResponse>> Handle(UpdateExamVersionDraftCommand request, CancellationToken ct)
        {
            var version = await _draftRepository.GetVersionForUpdateAsync(request.Id, ct);
            if (version is null)
                return Result<ExamVersionResponse>.Failure("Exam version is not found.", 404);

            if (version.Status != EExamTemplateStatus.Draft)
                return Result<ExamVersionResponse>.Failure("Only draft exam version can be updated.", 400);

            if (await _draftRepository.HasAttemptsAsync(version.Id, ct))
                return Result<ExamVersionResponse>.Failure("Exam version already has attempts and cannot be updated.", 409);

            var versionCode = request.VersionCode.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.ExamTemplateId == version.ExamTemplateId && x.VersionCode == versionCode, ct))
                return Result<ExamVersionResponse>.Failure("Exam version code already exists in this template.", 409);

            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.ExamTemplateId == version.ExamTemplateId && x.VersionNumber == request.VersionNumber, ct))
                return Result<ExamVersionResponse>.Failure("Exam version number already exists in this template.", 409);

            version.VersionCode = versionCode;
            version.VersionNumber = request.VersionNumber;
            version.Name = request.Name.Trim();
            version.Description = request.Description?.Trim();
            version.DurationMinutes = request.DurationMinutes;
            version.TotalScore = request.TotalScore;
            version.ScoringMode = request.ScoringMode;
            version.RuntimeConfigJson = request.RuntimeConfigJson;
            version.ScoringConfigJson = request.ScoringConfigJson;
            version.UpdatedAt = DateTimeOffset.UtcNow;

            var sections = ExamVersionDraftBuilder.BuildSections(request.Sections);
            var scoringRules = ExamVersionDraftBuilder.BuildScoringRules(request.ScoringRules);
            await _draftRepository.ReplaceVersionContentAsync(version, sections, scoringRules, ct);

            var updatedVersion = await _readRepository.GetVersionWithContentAsync(version.Id, asNoTracking: true, ct);
            return Result<ExamVersionResponse>.Success((updatedVersion ?? version).ToResponse());
        }
    }
}
