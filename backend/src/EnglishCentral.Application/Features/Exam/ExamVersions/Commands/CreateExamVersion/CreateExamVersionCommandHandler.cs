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

            if (await ExamVersionIdentityHelper.IsNameUsedAsync(_repository, request.ExamTemplateId, request.Name, excludeVersionId: null, ct))
                return Result<ExamVersionResponse>.Failure("Exam version name already exists.", 409);

            const int versionNumber = ExamVersionIdentityHelper.InitialVersionNumber;
            var slug = await ExamVersionIdentityHelper.CreateUniqueSlugAsync(
                _repository,
                request.ExamTemplateId,
                request.Slug,
                request.Name,
                versionNumber,
                excludeVersionId: null,
                ct);

            var version = new ExamVersion
            {
                ExamTemplateId = request.ExamTemplateId,
                Slug = slug,
                VersionNumber = versionNumber,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                Status = EExamTemplateStatus.Draft,
                DurationMinutes = request.DurationMinutes,
                TotalScore = request.TotalScore,
                ScoringMode = request.ScoringMode,
                RuntimeConfigJson = ExamJsonConfigNormalizer.NormalizeToString(request.RuntimeConfigJson),
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
