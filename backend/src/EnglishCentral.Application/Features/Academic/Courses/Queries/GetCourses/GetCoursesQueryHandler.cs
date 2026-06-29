using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Queries.GetCourses
{
    public class GetCoursesQueryHandler : IRequestHandler<GetCoursesQuery, Result<PagedResult<CourseResponse>>>
    {
        private readonly IAcademicRepository<Course> _repository;

        public GetCoursesQueryHandler(IAcademicRepository<Course> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<CourseResponse>>> Handle(GetCoursesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(x => x.Code.ToLower().Contains(keyword) || x.Name.ToLower().Contains(keyword));
            }

            if (request.CourseCategoryId.HasValue)
                query = query.Where(x => x.CourseCategoryId == request.CourseCategoryId.Value);

            if (request.IsActive.HasValue)
                query = query.Where(x => x.IsActive == request.IsActive.Value);

            query = request.SortBy?.Trim().ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "tuitionfee" => request.IsDescending ? query.OrderByDescending(x => x.TuitionFee) : query.OrderBy(x => x.TuitionFee),
                "displayorder" => request.IsDescending ? query.OrderByDescending(x => x.DisplayOrder) : query.OrderBy(x => x.DisplayOrder),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var courses = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = courses.Select(x => x.ToResponse()).ToList();

            return Result<PagedResult<CourseResponse>>.Success(PagedResult<CourseResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
