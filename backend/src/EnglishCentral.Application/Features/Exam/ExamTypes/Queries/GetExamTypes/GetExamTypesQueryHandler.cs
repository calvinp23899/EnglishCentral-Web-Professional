using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamTypes.Queries.GetExamTypes
{
    public class GetExamTypesQueryHandler : IRequestHandler<GetExamTypesQuery, Result<PagedResult<ExamTypeResponse>>>
    {
        private readonly IExamRepository<ExamType> _repository;

        public GetExamTypesQueryHandler(IExamRepository<ExamType> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<ExamTypeResponse>>> Handle(GetExamTypesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(x => x.Code.ToLower().Contains(keyword) || x.Name.ToLower().Contains(keyword));
            }

            if (request.Family.HasValue)
                query = query.Where(x => x.Family == request.Family.Value);
            if (request.IsActive.HasValue)
                query = query.Where(x => x.IsActive == request.IsActive.Value);

            query = request.SortBy?.Trim().ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "family" => request.IsDescending ? query.OrderByDescending(x => x.Family) : query.OrderBy(x => x.Family),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var items = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            return Result<PagedResult<ExamTypeResponse>>.Success(
                PagedResult<ExamTypeResponse>.Create(items.Select(x => x.ToResponse()).ToList(), request.Page, request.PageSize, totalItems));
        }
    }
}
