using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Features.Exam.ExamVersions.Services;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CreateExamVersion
{
    public class CreateExamVersionCommandHandler : IRequestHandler<CreateExamVersionCommand, Result<ExamVersionResponse>>
    {
        private readonly IExamRepository<ExamVersion> _repository;
        private readonly IExamRepository<ExamTemplate> _templateRepository;

        public CreateExamVersionCommandHandler(IExamRepository<ExamVersion> repository, IExamRepository<ExamTemplate> templateRepository)
        {
            _repository = repository;
            _templateRepository = templateRepository;
        }

        public async Task<Result<ExamVersionResponse>> Handle(CreateExamVersionCommand request, CancellationToken ct)
        {
            var template = await _templateRepository.GetByIdAsync(request.ExamTemplateId, ct);
            if (template is null)
                return Result<ExamVersionResponse>.Failure("Exam template is not found.", 404);

            var versionCode = request.VersionCode.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.ExamTemplateId == request.ExamTemplateId && x.VersionCode == versionCode, ct))
                return Result<ExamVersionResponse>.Failure("Exam version code already exists in this template.", 409);

            if (await _repository.ExistsAsync(x => x.ExamTemplateId == request.ExamTemplateId && x.VersionNumber == request.VersionNumber, ct))
                return Result<ExamVersionResponse>.Failure("Exam version number already exists in this template.", 409);

            var version = new ExamVersion
            {
                ExamTemplateId = request.ExamTemplateId,
                VersionCode = versionCode,
                VersionNumber = request.VersionNumber,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                Status = EExamTemplateStatus.Draft,
                DurationMinutes = request.DurationMinutes,
                TotalScore = request.TotalScore,
                ScoringMode = request.ScoringMode,
                RuntimeConfigJson = request.RuntimeConfigJson,
                ScoringConfigJson = request.ScoringConfigJson,
            };

            foreach (var section in ExamVersionDraftBuilder.BuildSections(request.Sections))
                version.Sections.Add(section);

            foreach (var scoringRule in ExamVersionDraftBuilder.BuildScoringRules(request.ScoringRules))
                version.ScoringRules.Add(scoringRule);

            await _repository.AddAsync(version, ct);
            return Result<ExamVersionResponse>.Success(version.ToResponse(), 201);
        }
    }
}
