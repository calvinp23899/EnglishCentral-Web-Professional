using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Commands.CloneExamVersionDraft
{
    public record CloneExamVersionDraftCommand(
        long SourceVersionId,
        string VersionCode,
        int VersionNumber,
        string Name,
        string? Description) : IRequest<Result<ExamVersionResponse>>;
}
