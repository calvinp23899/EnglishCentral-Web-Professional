using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CreateExamVersion
{
    public record CreateExamVersionCommand(
        long ExamTemplateId,
        string VersionCode,
        int VersionNumber,
        string Name,
        string? Description,
        int? DurationMinutes,
        decimal? TotalScore,
        EExamScoringMode ScoringMode,
        string? RuntimeConfigJson,
        string? ScoringConfigJson,
        List<CreateExamSectionRequest> Sections,
        List<CreateExamScoringRuleRequest>? ScoringRules) : IRequest<Result<ExamVersionResponse>>;

    public record CreateExamSectionRequest(
        string Code,
        string Name,
        EExamSkill Skill,
        int OrderIndex,
        int? DurationMinutes,
        decimal? MaxScore,
        string? Instructions,
        string? RuntimeConfigJson,
        List<CreateExamPartRequest> Parts);

    public record CreateExamPartRequest(
        string Code,
        string Name,
        int OrderIndex,
        string? Instructions,
        string? LayoutConfigJson,
        List<CreateExamStimulusRequest>? Stimuli,
        List<CreateExamQuestionGroupRequest> QuestionGroups);

    public record CreateExamStimulusRequest(
        string ClientKey,
        EExamStimulusType Type,
        string? Title,
        string? Content,
        string? AssetUrl,
        string? Transcript,
        int OrderIndex,
        string? MetadataJson);

    public record CreateExamQuestionGroupRequest(
        string Code,
        string? StimulusClientKey,
        string? Title,
        string? Instructions,
        EExamQuestionType QuestionType,
        int OrderIndex,
        string? ConfigJson,
        List<CreateExamQuestionRequest> Questions);

    public record CreateExamQuestionRequest(
        string Code,
        string? Prompt,
        EExamQuestionType QuestionType,
        int OrderIndex,
        decimal Points,
        bool IsRequired,
        string? Explanation,
        string? MetadataJson,
        List<CreateExamAnswerOptionRequest>? AnswerOptions,
        List<CreateExamAnswerKeyRequest>? AnswerKeys);

    public record CreateExamAnswerOptionRequest(
        string ClientKey,
        string Label,
        string Content,
        int OrderIndex,
        string? MetadataJson);

    public record CreateExamAnswerKeyRequest(
        string? AnswerOptionClientKey,
        string? CorrectValue,
        string? MatchPattern,
        decimal Score,
        bool CaseSensitive,
        int OrderIndex);

    public record CreateExamScoringRuleRequest(
        string RuleCode,
        string Name,
        EExamSkill? Skill,
        EExamQuestionType? QuestionType,
        decimal? MaxScore,
        string ConfigJson);
}
