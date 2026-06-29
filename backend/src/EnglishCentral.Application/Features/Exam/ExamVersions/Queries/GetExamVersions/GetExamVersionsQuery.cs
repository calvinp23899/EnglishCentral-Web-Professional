using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersions
{
    public record GetExamVersionsQuery : IRequest<Result<PagedResult<ExamVersionResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public long? ExamTemplateId { get; init; }
        public EExamTemplateStatus? Status { get; init; }
        public string? Keyword { get; init; }
        public bool IsDescending { get; init; } = true;
    }
}
