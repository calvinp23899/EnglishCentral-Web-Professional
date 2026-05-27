using EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Queries.GetClassSchedules
{
    public class GetClassSchedulesQueryHandler : IRequestHandler<GetClassSchedulesQuery, Result<PagedResult<ClassScheduleResponse>>>
    {
        private readonly IAcademicRepository<ClassSchedule> _repository;

        public GetClassSchedulesQueryHandler(IAcademicRepository<ClassSchedule> repository)
        {
            _repository = repository;
        }

        public async Task<Result<PagedResult<ClassScheduleResponse>>> Handle(GetClassSchedulesQuery request, CancellationToken ct)
        {
            var query = _repository.Query();
            if (request.ClassId.HasValue)
                query = query.Where(x => x.ClassId == request.ClassId.Value);

            query = request.IsDescending
                ? query.OrderByDescending(x => x.DayOfWeek).ThenByDescending(x => x.StartTime)
                : query.OrderBy(x => x.DayOfWeek).ThenBy(x => x.StartTime);

            var totalItems = await _repository.CountAsync(_ => query, ct);
            var schedules = await _repository.ListAsync(_ => query.Skip((request.Page - 1) * request.PageSize).Take(request.PageSize), ct);
            var items = schedules.Select(x => x.ToResponse()).ToList();
            return Result<PagedResult<ClassScheduleResponse>>.Success(PagedResult<ClassScheduleResponse>.Create(items, request.Page, request.PageSize, totalItems));
        }
    }
}
