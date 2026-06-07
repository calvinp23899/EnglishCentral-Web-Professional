using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using DomainExamQuestionResponse = EnglishCentral.Domain.Entities.Exam.ExamQuestionResponse;

namespace EnglishCentral.Application.Features.Exam.DTOs
{
    public record ExamTypeResponse(
        Guid PublicId,
        long Id,
        string Code,
        string Name,
        EExamFamily Family,
        string? Description,
        bool IsActive);

    public record ExamTemplateResponse(
        Guid PublicId,
        long Id,
        long ExamTypeId,
        long? CurrentVersionId,
        string Code,
        string Name,
        string? Description,
        int? DurationMinutes,
        decimal? TotalScore,
        EExamTemplateStatus Status,
        bool IsActive);

    public record ExamVersionResponse(
        Guid PublicId,
        long Id,
        long ExamTemplateId,
        string VersionCode,
        int VersionNumber,
        string Name,
        string? Description,
        EExamTemplateStatus Status,
        int? DurationMinutes,
        decimal? TotalScore,
        EExamScoringMode ScoringMode,
        string? RuntimeConfigJson,
        string? ScoringConfigJson,
        DateTimeOffset? PublishedAt,
        List<ExamSectionResponse> Sections,
        List<ExamScoringRuleResponse> ScoringRules);

    public record ExamSectionResponse(
        Guid PublicId,
        long Id,
        string Code,
        string Name,
        EExamSkill Skill,
        int OrderIndex,
        int? DurationMinutes,
        decimal? MaxScore,
        string? Instructions,
        string? RuntimeConfigJson,
        List<ExamPartResponse> Parts);

    public record ExamPartResponse(
        Guid PublicId,
        long Id,
        string Code,
        string Name,
        int OrderIndex,
        string? Instructions,
        string? LayoutConfigJson,
        List<ExamStimulusResponse> Stimuli,
        List<ExamQuestionGroupResponse> QuestionGroups);

    public record ExamStimulusResponse(
        Guid PublicId,
        long Id,
        EExamStimulusType Type,
        string? Title,
        string? Content,
        string? AssetUrl,
        string? Transcript,
        int OrderIndex,
        string? MetadataJson);

    public record ExamQuestionGroupResponse(
        Guid PublicId,
        long Id,
        long? ExamStimulusId,
        string Code,
        string? Title,
        string? Instructions,
        EExamQuestionType QuestionType,
        int OrderIndex,
        string? ConfigJson,
        List<ExamQuestionResponse> Questions);

    public record ExamQuestionResponse(
        Guid PublicId,
        long Id,
        string Code,
        string? Prompt,
        EExamQuestionType QuestionType,
        int OrderIndex,
        decimal Points,
        bool IsRequired,
        string? Explanation,
        string? MetadataJson,
        List<ExamAnswerOptionResponse> AnswerOptions,
        List<ExamAnswerKeyResponse> AnswerKeys);

    public record ExamAnswerOptionResponse(
        Guid PublicId,
        long Id,
        string Label,
        string Content,
        int OrderIndex,
        string? MetadataJson);

    public record ExamAnswerKeyResponse(
        Guid PublicId,
        long Id,
        long? ExamAnswerOptionId,
        string? CorrectValue,
        string? MatchPattern,
        decimal Score,
        bool CaseSensitive,
        int OrderIndex);

    public record ExamScoringRuleResponse(
        Guid PublicId,
        long Id,
        long? ExamSectionId,
        EExamSkill? Skill,
        EExamQuestionType? QuestionType,
        string RuleCode,
        string Name,
        decimal? MaxScore,
        string ConfigJson);

    public record ExamAttemptResponse(
        Guid PublicId,
        long Id,
        long ExamVersionId,
        long? StudentId,
        string AttemptCode,
        string? CandidateName,
        string? CandidateEmail,
        EExamAttemptStatus Status,
        DateTimeOffset? StartedAt,
        DateTimeOffset? SubmittedAt,
        DateTimeOffset? CompletedAt,
        int? DurationSeconds,
        decimal? RawScore,
        decimal? ScaledScore,
        decimal? BandScore,
        string? ResultLevel,
        List<ExamSectionAttemptResponse> SectionAttempts,
        List<ExamQuestionResponseResponse> Responses);

    public record ExamSectionAttemptResponse(
        Guid PublicId,
        long Id,
        long ExamSectionId,
        EExamAttemptStatus Status,
        DateTimeOffset? StartedAt,
        DateTimeOffset? SubmittedAt,
        int? DurationSeconds,
        decimal? RawScore,
        decimal? ScaledScore,
        decimal? BandScore);

    public record ExamQuestionResponseResponse(
        Guid PublicId,
        long Id,
        long? ExamSectionAttemptId,
        long ExamQuestionId,
        long? ExamAnswerOptionId,
        string? AnswerText,
        string? AnswerJson,
        decimal? Score,
        bool? IsCorrect,
        EExamReviewStatus ReviewStatus,
        string? Feedback,
        DateTimeOffset? AnsweredAt);

    public record ExamReviewResponse(
        Guid PublicId,
        long Id,
        long ExamAttemptId,
        long? ReviewerId,
        EExamReviewStatus Status,
        decimal? Score,
        string? Feedback,
        string? RubricJson,
        DateTimeOffset? ReviewedAt);

    public static class ExamMappings
    {
        public static ExamTypeResponse ToResponse(this ExamType entity) => new(
            entity.PublicId,
            entity.Id,
            entity.Code,
            entity.Name,
            entity.Family,
            entity.Description,
            entity.IsActive);

        public static ExamTemplateResponse ToResponse(this ExamTemplate entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamTypeId,
            entity.CurrentVersionId,
            entity.Code,
            entity.Name,
            entity.Description,
            entity.DurationMinutes,
            entity.TotalScore,
            entity.Status,
            entity.IsActive);

        public static ExamVersionResponse ToResponse(this ExamVersion entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamTemplateId,
            entity.VersionCode,
            entity.VersionNumber,
            entity.Name,
            entity.Description,
            entity.Status,
            entity.DurationMinutes,
            entity.TotalScore,
            entity.ScoringMode,
            entity.RuntimeConfigJson,
            entity.ScoringConfigJson,
            entity.PublishedAt,
            entity.Sections.OrderBy(x => x.OrderIndex).Select(x => x.ToResponse()).ToList(),
            entity.ScoringRules.OrderBy(x => x.RuleCode).Select(x => x.ToResponse()).ToList());

        public static ExamSectionResponse ToResponse(this ExamSection entity) => new(
            entity.PublicId,
            entity.Id,
            entity.Code,
            entity.Name,
            entity.Skill,
            entity.OrderIndex,
            entity.DurationMinutes,
            entity.MaxScore,
            entity.Instructions,
            entity.RuntimeConfigJson,
            entity.Parts.OrderBy(x => x.OrderIndex).Select(x => x.ToResponse()).ToList());

        public static ExamPartResponse ToResponse(this ExamPart entity) => new(
            entity.PublicId,
            entity.Id,
            entity.Code,
            entity.Name,
            entity.OrderIndex,
            entity.Instructions,
            entity.LayoutConfigJson,
            entity.Stimuli.OrderBy(x => x.OrderIndex).Select(x => x.ToResponse()).ToList(),
            entity.QuestionGroups.OrderBy(x => x.OrderIndex).Select(x => x.ToResponse()).ToList());

        public static ExamStimulusResponse ToResponse(this ExamStimulus entity) => new(
            entity.PublicId,
            entity.Id,
            entity.Type,
            entity.Title,
            entity.Content,
            entity.AssetUrl,
            entity.Transcript,
            entity.OrderIndex,
            entity.MetadataJson);

        public static ExamQuestionGroupResponse ToResponse(this ExamQuestionGroup entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamStimulusId,
            entity.Code,
            entity.Title,
            entity.Instructions,
            entity.QuestionType,
            entity.OrderIndex,
            entity.ConfigJson,
            entity.Questions.OrderBy(x => x.OrderIndex).Select(x => x.ToResponse()).ToList());

        public static ExamQuestionResponse ToResponse(this ExamQuestion entity) => new(
            entity.PublicId,
            entity.Id,
            entity.Code,
            entity.Prompt,
            entity.QuestionType,
            entity.OrderIndex,
            entity.Points,
            entity.IsRequired,
            entity.Explanation,
            entity.MetadataJson,
            entity.AnswerOptions.OrderBy(x => x.OrderIndex).Select(x => x.ToResponse()).ToList(),
            entity.AnswerKeys.OrderBy(x => x.OrderIndex).Select(x => x.ToResponse()).ToList());

        public static ExamAnswerOptionResponse ToResponse(this ExamAnswerOption entity) => new(
            entity.PublicId,
            entity.Id,
            entity.Label,
            entity.Content,
            entity.OrderIndex,
            entity.MetadataJson);

        public static ExamAnswerKeyResponse ToResponse(this ExamAnswerKey entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamAnswerOptionId,
            entity.CorrectValue,
            entity.MatchPattern,
            entity.Score,
            entity.CaseSensitive,
            entity.OrderIndex);

        public static ExamScoringRuleResponse ToResponse(this ExamScoringRule entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamSectionId,
            entity.Skill,
            entity.QuestionType,
            entity.RuleCode,
            entity.Name,
            entity.MaxScore,
            entity.ConfigJson);

        public static ExamAttemptResponse ToResponse(this ExamAttempt entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamVersionId,
            entity.StudentId,
            entity.AttemptCode,
            entity.CandidateName,
            entity.CandidateEmail,
            entity.Status,
            entity.StartedAt,
            entity.SubmittedAt,
            entity.CompletedAt,
            entity.DurationSeconds,
            entity.RawScore,
            entity.ScaledScore,
            entity.BandScore,
            entity.ResultLevel,
            entity.SectionAttempts.OrderBy(x => x.Id).Select(x => x.ToResponse()).ToList(),
            entity.Responses.OrderBy(x => x.ExamQuestionId).Select(x => x.ToResponse()).ToList());

        public static ExamSectionAttemptResponse ToResponse(this ExamSectionAttempt entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamSectionId,
            entity.Status,
            entity.StartedAt,
            entity.SubmittedAt,
            entity.DurationSeconds,
            entity.RawScore,
            entity.ScaledScore,
            entity.BandScore);

        public static ExamQuestionResponseResponse ToResponse(this DomainExamQuestionResponse entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamSectionAttemptId,
            entity.ExamQuestionId,
            entity.ExamAnswerOptionId,
            entity.AnswerText,
            entity.AnswerJson,
            entity.Score,
            entity.IsCorrect,
            entity.ReviewStatus,
            entity.Feedback,
            entity.AnsweredAt);

        public static ExamReviewResponse ToResponse(this ExamReview entity) => new(
            entity.PublicId,
            entity.Id,
            entity.ExamAttemptId,
            entity.ReviewerId,
            entity.Status,
            entity.Score,
            entity.Feedback,
            entity.RubricJson,
            entity.ReviewedAt);
    }
}
