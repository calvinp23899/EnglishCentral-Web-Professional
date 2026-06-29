using EnglishCentral.Application.Features.Exam.DTOs;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Queries.GetExamVersions
{
    public class GetExamVersionsQueryHandler : IRequestHandler<GetExamVersionsQuery, Result<PagedResult<ExamVersionResponse>>>
    {
        private readonly IExamRepository<ExamVersion> _repository;

        public GetExamVersionsQueryHandler(IExamRepository<ExamVersion> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<ExamVersionResponse>>> Handle(GetExamVersionsQuery request, CancellationToken ct)
        {
            var query = _repository.Query();

            if (request.ExamTemplateId.HasValue)
                query = query.Where(x => x.ExamTemplateId == request.ExamTemplateId.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);
            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keyword = request.Keyword.Trim().ToLower();
                query = query.Where(x => x.VersionCode.ToLower().Contains(keyword) || x.Name.ToLower().Contains(keyword));
            }

            query = request.IsDescending
                ? query.OrderByDescending(x => x.CreatedAt)
                : query.OrderBy(x => x.CreatedAt);

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var items = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            return Result<PagedResult<ExamVersionResponse>>.Success(
                PagedResult<ExamVersionResponse>.Create(items.Select(x => x.ToResponse()).ToList(), request.Page, request.PageSize, totalItems));
        }
    }
}
