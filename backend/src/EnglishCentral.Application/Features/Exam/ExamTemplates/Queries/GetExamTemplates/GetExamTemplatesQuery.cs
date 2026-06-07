using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTemplates.Queries.GetExamTemplates
{
    public record GetExamTemplatesQuery : IRequest<Result<PagedResult<ExamTemplateResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public long? ExamTypeId { get; init; }
        public EExamTemplateStatus? Status { get; init; }
        public bool? IsActive { get; init; }
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
    }
}
