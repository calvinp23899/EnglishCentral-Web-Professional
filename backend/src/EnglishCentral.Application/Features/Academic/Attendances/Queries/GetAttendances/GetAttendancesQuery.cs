using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Queries.GetAttendances
{
    public record GetAttendancesQuery : IRequest<Result<PagedResult<AttendanceResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public bool IsDescending { get; init; } = true;
        public long? SessionId { get; init; }
        public long? StudentId { get; init; }
        public AttendanceStatus? Status { get; init; }
    }
}
