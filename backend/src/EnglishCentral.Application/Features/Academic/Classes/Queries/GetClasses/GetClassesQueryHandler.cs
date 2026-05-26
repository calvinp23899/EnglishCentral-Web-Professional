using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.Classes.Queries.GetClasses
{
    public class GetClassesQueryHandler : IRequestHandler<GetClassesQuery, Result<PagedResult<ClassResponse>>>
    {
        private readonly IAcademicRepository<AcademicClass> _repository;

        public GetClassesQueryHandler(IAcademicRepository<AcademicClass> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<ClassResponse>>> Handle(GetClassesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(x => x.Code.ToLower().Contains(keyword) || x.Name.ToLower().Contains(keyword));
            }

            if (request.CourseId.HasValue)
                query = query.Where(x => x.CourseId == request.CourseId.Value);
            if (request.TeacherId.HasValue)
                query = query.Where(x => x.TeacherId == request.TeacherId.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            query = request.SortBy?.Trim().ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "startdate" => request.IsDescending ? query.OrderByDescending(x => x.StartDate) : query.OrderBy(x => x.StartDate),
                "status" => request.IsDescending ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var classes = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = classes.Select(x => x.ToResponse()).ToList();

            return Result<PagedResult<ClassResponse>>.Success(PagedResult<ClassResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
