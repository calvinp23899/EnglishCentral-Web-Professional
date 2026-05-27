using EnglishCentral.Application.Features.Academic.ClassSessions.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Queries.GetClassSessions
{
    public class GetClassSessionsQueryHandler : IRequestHandler<GetClassSessionsQuery, Result<PagedResult<ClassSessionResponse>>>
    {
        private readonly IAcademicRepository<ClassSession> _repository;

        public GetClassSessionsQueryHandler(IAcademicRepository<ClassSession> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<ClassSessionResponse>>> Handle(GetClassSessionsQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.ClassId.HasValue)
                query = query.Where(x => x.ClassId == request.ClassId.Value);
            if (request.TeacherId.HasValue)
                query = query.Where(x => x.TeacherId == request.TeacherId.Value || x.SubstituteTeacherId == request.TeacherId.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);
            if (request.Date.HasValue)
                query = query.Where(x => x.SessionDate == request.Date.Value);

            query = request.IsDescending
                ? query.OrderByDescending(x => x.SessionDate).ThenByDescending(x => x.StartTime)
                : query.OrderBy(x => x.SessionDate).ThenBy(x => x.StartTime);

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var sessions = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = sessions.Select(x => x.ToResponse()).ToList();
            return Result<PagedResult<ClassSessionResponse>>.Success(PagedResult<ClassSessionResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
