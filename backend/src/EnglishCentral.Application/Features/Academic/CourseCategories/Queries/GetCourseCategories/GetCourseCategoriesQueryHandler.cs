using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Queries.GetCourseCategories
{
    public class GetCourseCategoriesQueryHandler : IRequestHandler<GetCourseCategoriesQuery, Result<PagedResult<CourseCategoryResponse>>>
    {
        private readonly IAcademicRepository<CourseCategory> _repository;

        public GetCourseCategoriesQueryHandler(IAcademicRepository<CourseCategory> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<CourseCategoryResponse>>> Handle(GetCourseCategoriesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(x => x.Code.ToLower().Contains(keyword) || x.Name.ToLower().Contains(keyword));
            }

            if (request.IsActive.HasValue)
                query = query.Where(x => x.IsActive == request.IsActive.Value);

            query = request.SortBy?.Trim().ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var categories = await _repository.ListAsync(_ => query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize), ct);
            var items = categories.Select(x => x.ToResponse()).ToList();

            return Result<PagedResult<CourseCategoryResponse>>.Success(
                PagedResult<CourseCategoryResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
