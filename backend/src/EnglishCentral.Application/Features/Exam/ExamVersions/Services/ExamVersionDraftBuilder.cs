using EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CreateExamVersion;
using EnglishCentral.Domain.Entities.Exam;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Services
{
    public static class ExamVersionDraftBuilder
    {
        public static List<ExamSection> BuildSections(IEnumerable<CreateExamSectionRequest> sectionRequests)
        {
            var sections = new List<ExamSection>();

            foreach (var sectionRequest in sectionRequests)
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

                sections.Add(section);
            }

            return sections;
        }

        public static List<ExamScoringRule> BuildScoringRules(IEnumerable<CreateExamScoringRuleRequest>? ruleRequests)
        {
            return (ruleRequests ?? [])
                .Select(ruleRequest => new ExamScoringRule
                {
                    RuleCode = ruleRequest.RuleCode.Trim().ToUpperInvariant(),
                    Name = ruleRequest.Name.Trim(),
                    Skill = ruleRequest.Skill,
                    QuestionType = ruleRequest.QuestionType,
                    MaxScore = ruleRequest.MaxScore,
                    ConfigJson = ruleRequest.ConfigJson
                })
                .ToList();
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
