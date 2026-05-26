using EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Queries.GetClassSchedules
{
    public record GetClassSchedulesQuery : IRequest<Result<PagedResult<ClassScheduleResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
        public long? ClassId { get; init; }
    }
}
