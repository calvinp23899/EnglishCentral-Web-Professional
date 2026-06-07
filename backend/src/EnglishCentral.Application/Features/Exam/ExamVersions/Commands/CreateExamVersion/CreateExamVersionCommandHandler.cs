using EnglishCentral.Application.Features.Exam.DTOs;
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
                CreatedAt = DateTimeOffset.UtcNow
            };

            foreach (var sectionRequest in request.Sections)
            {
                var section = new ExamSection
                {
                    Code = sectionRequest.Code.Trim().ToUpperInvariant(),
                    Name = sectionRequest.Name.Trim(),
                    Skill = sectionRequest.Skill,
                    OrderIndex = sectionRequest.OrderIndex,
                    DurationMinutes = sectionRequest.DurationMinutes,
                    MaxScore = sectionRequest.MaxScore,
                    Instructions = sectionRequest.Instructions,
                    RuntimeConfigJson = sectionRequest.RuntimeConfigJson
                };

                foreach (var partRequest in sectionRequest.Parts)
                {
                    var part = new ExamPart
                    {
                        Code = partRequest.Code.Trim().ToUpperInvariant(),
                        Name = partRequest.Name.Trim(),
                        OrderIndex = partRequest.OrderIndex,
                        Instructions = partRequest.Instructions,
                        LayoutConfigJson = partRequest.LayoutConfigJson
                    };

                    var stimulusByClientKey = new Dictionary<string, ExamStimulus>(StringComparer.OrdinalIgnoreCase);
                    foreach (var stimulusRequest in partRequest.Stimuli ?? [])
                    {
                        var stimulus = new ExamStimulus
                        {
                            Type = stimulusRequest.Type,
                            Title = stimulusRequest.Title?.Trim(),
                            Content = stimulusRequest.Content,
                            AssetUrl = stimulusRequest.AssetUrl?.Trim(),
                            Transcript = stimulusRequest.Transcript,
                            OrderIndex = stimulusRequest.OrderIndex,
                            MetadataJson = stimulusRequest.MetadataJson
                        };
                        part.Stimuli.Add(stimulus);
                        stimulusByClientKey[stimulusRequest.ClientKey.Trim()] = stimulus;
                    }

                    foreach (var groupRequest in partRequest.QuestionGroups)
                    {
                        var group = new ExamQuestionGroup
                        {
                            Code = groupRequest.Code.Trim().ToUpperInvariant(),
                            ExamStimulus = ResolveStimulus(groupRequest.StimulusClientKey, stimulusByClientKey),
                            Title = groupRequest.Title?.Trim(),
                            Instructions = groupRequest.Instructions,
                            QuestionType = groupRequest.QuestionType,
                            OrderIndex = groupRequest.OrderIndex,
                            ConfigJson = groupRequest.ConfigJson
                        };

                        foreach (var questionRequest in groupRequest.Questions)
                        {
                            var question = new ExamQuestion
                            {
                                Code = questionRequest.Code.Trim().ToUpperInvariant(),
                                Prompt = questionRequest.Prompt,
                                QuestionType = questionRequest.QuestionType,
                                OrderIndex = questionRequest.OrderIndex,
                                Points = questionRequest.Points,
                                IsRequired = questionRequest.IsRequired,
                                Explanation = questionRequest.Explanation,
                                MetadataJson = questionRequest.MetadataJson
                            };

                            var optionByClientKey = new Dictionary<string, ExamAnswerOption>(StringComparer.OrdinalIgnoreCase);
                            foreach (var optionRequest in questionRequest.AnswerOptions ?? [])
                            {
                                var option = new ExamAnswerOption
                                {
                                    Label = optionRequest.Label.Trim(),
                                    Content = optionRequest.Content,
                                    OrderIndex = optionRequest.OrderIndex,
                                    MetadataJson = optionRequest.MetadataJson
                                };
                                question.AnswerOptions.Add(option);
                                optionByClientKey[optionRequest.ClientKey.Trim()] = option;
                            }

                            foreach (var keyRequest in questionRequest.AnswerKeys ?? [])
                            {
                                question.AnswerKeys.Add(new ExamAnswerKey
                                {
                                    ExamAnswerOption = ResolveOption(keyRequest.AnswerOptionClientKey, optionByClientKey),
                                    CorrectValue = keyRequest.CorrectValue?.Trim(),
                                    MatchPattern = keyRequest.MatchPattern?.Trim(),
                                    Score = keyRequest.Score,
                                    CaseSensitive = keyRequest.CaseSensitive,
                                    OrderIndex = keyRequest.OrderIndex
                                });
                            }

                            group.Questions.Add(question);
                        }

                        part.QuestionGroups.Add(group);
                    }

                    section.Parts.Add(part);
                }

                version.Sections.Add(section);
            }

            foreach (var ruleRequest in request.ScoringRules ?? [])
            {
                version.ScoringRules.Add(new ExamScoringRule
                {
                    RuleCode = ruleRequest.RuleCode.Trim().ToUpperInvariant(),
                    Name = ruleRequest.Name.Trim(),
                    Skill = ruleRequest.Skill,
                    QuestionType = ruleRequest.QuestionType,
                    MaxScore = ruleRequest.MaxScore,
                    ConfigJson = ruleRequest.ConfigJson
                });
            }

            await _repository.AddAsync(version, ct);
            return Result<ExamVersionResponse>.Success(version.ToResponse(), 201);
        }

        private static ExamStimulus? ResolveStimulus(string? clientKey, Dictionary<string, ExamStimulus> stimulusByClientKey)
        {
            if (string.IsNullOrWhiteSpace(clientKey))
                return null;

            return stimulusByClientKey.TryGetValue(clientKey.Trim(), out var stimulus)
                ? stimulus
                : null;
        }

        private static ExamAnswerOption? ResolveOption(string? clientKey, Dictionary<string, ExamAnswerOption> optionByClientKey)
        {
            if (string.IsNullOrWhiteSpace(clientKey))
                return null;

            return optionByClientKey.TryGetValue(clientKey.Trim(), out var option)
                ? option
                : null;
        }
    }
}
