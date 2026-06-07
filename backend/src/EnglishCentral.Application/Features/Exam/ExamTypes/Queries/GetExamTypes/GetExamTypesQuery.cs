using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Queries.GetExamTypes
{
    public record GetExamTypesQuery : IRequest<Result<PagedResult<ExamTypeResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public EExamFamily? Family { get; init; }
        public bool? IsActive { get; init; }
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
    }
}
