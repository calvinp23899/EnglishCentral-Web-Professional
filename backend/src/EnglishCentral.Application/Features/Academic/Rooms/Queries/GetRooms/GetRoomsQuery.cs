using EnglishCentral.Application.Features.Academic.Rooms.DTOs;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Rooms.Queries.GetRooms
{
    public record GetRoomsQuery : IRequest<Result<PagedResult<RoomResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
        public bool? IsActive { get; init; }
    }
}
