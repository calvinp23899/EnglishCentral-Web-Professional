using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Queries.GetAttendances
{
    public class GetAttendancesQueryHandler : IRequestHandler<GetAttendancesQuery, Result<PagedResult<AttendanceResponse>>>
    {
        private readonly IAcademicRepository<Attendance> _repository;

        public GetAttendancesQueryHandler(IAcademicRepository<Attendance> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<AttendanceResponse>>> Handle(GetAttendancesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.SessionId.HasValue)
                query = query.Where(x => x.SessionId == request.SessionId.Value);
            if (request.StudentId.HasValue)
                query = query.Where(x => x.StudentId == request.StudentId.Value);
            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            query = request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt);
            var totalItems = await _repository.CountAsync(_ => query, ct);
            var attendances = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = attendances.Select(x => x.ToResponse()).ToList();
            return Result<PagedResult<AttendanceResponse>>.Success(PagedResult<AttendanceResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
