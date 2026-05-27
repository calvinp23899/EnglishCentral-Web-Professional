using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Queries.GetCourses
{
    public record GetCoursesQuery : IRequest<Result<PagedResult<CourseResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
        public long? CourseCategoryId { get; init; }
        public bool? IsActive { get; init; }
    }
}
