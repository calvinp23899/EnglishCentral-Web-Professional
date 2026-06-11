using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CloneExamVersionDraft
{
    public class CloneExamVersionDraftCommandHandler : IRequestHandler<CloneExamVersionDraftCommand, Result<ExamVersionResponse>>
    {
        private readonly IExamRepository<ExamVersion> _repository;
        private readonly IExamReadRepository _readRepository;

        public CloneExamVersionDraftCommandHandler(
            IExamRepository<ExamVersion> repository,
            IExamReadRepository readRepository)
        {
            _repository = repository;
            _readRepository = readRepository;
        }

        public async Task<Result<ExamVersionResponse>> Handle(CloneExamVersionDraftCommand request, CancellationToken ct)
        {
            var source = await _readRepository.GetVersionWithContentAsync(request.SourceVersionId, asNoTracking: true, ct);
            if (source is null)
                return Result<ExamVersionResponse>.Failure("Source exam version is not found.", 404);

            if (source.Status == EExamTemplateStatus.Draft)
                return Result<ExamVersionResponse>.Failure("Source version is already a draft. Update the draft directly instead.", 400);

            if (source.Status != EExamTemplateStatus.Published && source.Status != EExamTemplateStatus.Archived)
                return Result<ExamVersionResponse>.Failure("Only published or archived versions can be cloned.", 400);

            var versionCode = request.VersionCode.Trim().ToUpperInvariant();
            if (await _repository.ExistsAsync(x => x.ExamTemplateId == source.ExamTemplateId && x.VersionCode == versionCode, ct))
                return Result<ExamVersionResponse>.Failure("Exam version code already exists in this template.", 409);

            if (await _repository.ExistsAsync(x => x.ExamTemplateId == source.ExamTemplateId && x.VersionNumber == request.VersionNumber, ct))
                return Result<ExamVersionResponse>.Failure("Exam version number already exists in this template.", 409);

            var clone = new ExamVersion
            {
                ExamTemplateId = source.ExamTemplateId,
                VersionCode = versionCode,
                VersionNumber = request.VersionNumber,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? source.Description,
                Status = EExamTemplateStatus.Draft,
                DurationMinutes = source.DurationMinutes,
                TotalScore = source.TotalScore,
                ScoringMode = source.ScoringMode,
                RuntimeConfigJson = source.RuntimeConfigJson,
                ScoringConfigJson = source.ScoringConfigJson,
                CreatedAt = DateTimeOffset.UtcNow
            };

            CloneContent(source, clone);
            await _repository.AddAsync(clone, ct);

            return Result<ExamVersionResponse>.Success(clone.ToResponse(), 201);
        }

        private static void CloneContent(ExamVersion source, ExamVersion clone)
        {
            var sectionMap = new Dictionary<long, ExamSection>();

            foreach (var sourceSection in source.Sections.OrderBy(x => x.OrderIndex))
            {
                var clonedSection = new ExamSection
                {
                    Code = sourceSection.Code,
                    Name = sourceSection.Name,
                    Skill = sourceSection.Skill,
                    OrderIndex = sourceSection.OrderIndex,
                    DurationMinutes = sourceSection.DurationMinutes,
                    MaxScore = sourceSection.MaxScore,
                    Instructions = sourceSection.Instructions,
                    RuntimeConfigJson = sourceSection.RuntimeConfigJson
                };

                sectionMap[sourceSection.Id] = clonedSection;
                CloneParts(sourceSection, clonedSection);
                clone.Sections.Add(clonedSection);
            }

            foreach (var sourceRule in source.ScoringRules.OrderBy(x => x.RuleCode))
            {
                clone.ScoringRules.Add(new ExamScoringRule
                {
                    ExamSection = sourceRule.ExamSectionId.HasValue && sectionMap.TryGetValue(sourceRule.ExamSectionId.Value, out var mappedSection)
                        ? mappedSection
                        : null,
                    Skill = sourceRule.Skill,
                    QuestionType = sourceRule.QuestionType,
                    RuleCode = sourceRule.RuleCode,
                    Name = sourceRule.Name,
                    MaxScore = sourceRule.MaxScore,
                    ConfigJson = sourceRule.ConfigJson
                });
            }
        }

        private static void CloneParts(ExamSection sourceSection, ExamSection clonedSection)
        {
            foreach (var sourcePart in sourceSection.Parts.OrderBy(x => x.OrderIndex))
            {
                var clonedPart = new ExamPart
                {
                    Code = sourcePart.Code,
                    Name = sourcePart.Name,
                    OrderIndex = sourcePart.OrderIndex,
                    Instructions = sourcePart.Instructions,
                    LayoutConfigJson = sourcePart.LayoutConfigJson
                };

                var stimulusMap = new Dictionary<long, ExamStimulus>();
                foreach (var sourceStimulus in sourcePart.Stimuli.OrderBy(x => x.OrderIndex))
                {
                    var clonedStimulus = new ExamStimulus
                    {
                        Type = sourceStimulus.Type,
                        Title = sourceStimulus.Title,
                        Content = sourceStimulus.Content,
                        AssetUrl = sourceStimulus.AssetUrl,
                        Transcript = sourceStimulus.Transcript,
                        OrderIndex = sourceStimulus.OrderIndex,
                        MetadataJson = sourceStimulus.MetadataJson
                    };

                    stimulusMap[sourceStimulus.Id] = clonedStimulus;
                    clonedPart.Stimuli.Add(clonedStimulus);
                }

                CloneQuestionGroups(sourcePart, clonedPart, stimulusMap);
                clonedSection.Parts.Add(clonedPart);
            }
        }

        private static void CloneQuestionGroups(
            ExamPart sourcePart,
            ExamPart clonedPart,
            IReadOnlyDictionary<long, ExamStimulus> stimulusMap)
        {
            foreach (var sourceGroup in sourcePart.QuestionGroups.OrderBy(x => x.OrderIndex))
            {
                var clonedGroup = new ExamQuestionGroup
                {
                    ExamStimulus = sourceGroup.ExamStimulusId.HasValue && stimulusMap.TryGetValue(sourceGroup.ExamStimulusId.Value, out var mappedStimulus)
                        ? mappedStimulus
                        : null,
                    Code = sourceGroup.Code,
                    Title = sourceGroup.Title,
                    Instructions = sourceGroup.Instructions,
                    QuestionType = sourceGroup.QuestionType,
                    OrderIndex = sourceGroup.OrderIndex,
                    ConfigJson = sourceGroup.ConfigJson
                };

                CloneQuestions(sourceGroup, clonedGroup);
                clonedPart.QuestionGroups.Add(clonedGroup);
            }
        }

        private static void CloneQuestions(ExamQuestionGroup sourceGroup, ExamQuestionGroup clonedGroup)
        {
            foreach (var sourceQuestion in sourceGroup.Questions.OrderBy(x => x.OrderIndex))
            {
                var clonedQuestion = new ExamQuestion
                {
                    Code = sourceQuestion.Code,
                    Prompt = sourceQuestion.Prompt,
                    QuestionType = sourceQuestion.QuestionType,
                    OrderIndex = sourceQuestion.OrderIndex,
                    Points = sourceQuestion.Points,
                    IsRequired = sourceQuestion.IsRequired,
                    Explanation = sourceQuestion.Explanation,
                    MetadataJson = sourceQuestion.MetadataJson
                };

                var optionMap = new Dictionary<long, ExamAnswerOption>();
                foreach (var sourceOption in sourceQuestion.AnswerOptions.OrderBy(x => x.OrderIndex))
                {
                    var clonedOption = new ExamAnswerOption
                    {
                        Label = sourceOption.Label,
                        Content = sourceOption.Content,
                        OrderIndex = sourceOption.OrderIndex,
                        MetadataJson = sourceOption.MetadataJson
                    };

                    optionMap[sourceOption.Id] = clonedOption;
                    clonedQuestion.AnswerOptions.Add(clonedOption);
                }

                foreach (var sourceKey in sourceQuestion.AnswerKeys.OrderBy(x => x.OrderIndex))
                {
                    clonedQuestion.AnswerKeys.Add(new ExamAnswerKey
                    {
                        ExamAnswerOption = sourceKey.ExamAnswerOptionId.HasValue && optionMap.TryGetValue(sourceKey.ExamAnswerOptionId.Value, out var mappedOption)
                            ? mappedOption
                            : null,
                        CorrectValue = sourceKey.CorrectValue,
                        MatchPattern = sourceKey.MatchPattern,
                        Score = sourceKey.Score,
                        CaseSensitive = sourceKey.CaseSensitive,
                        OrderIndex = sourceKey.OrderIndex
                    });
                }

                clonedGroup.Questions.Add(clonedQuestion);
            }
        }
    }
}
