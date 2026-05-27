using EnglishCentral.Application.Features.Academic.ClassSessions.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Queries.GetClassSessions
{
    public record GetClassSessionsQuery : IRequest<Result<PagedResult<ClassSessionResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public bool IsDescending { get; init; } = true;
        public long? ClassId { get; init; }
        public long? TeacherId { get; init; }
        public SessionStatus? Status { get; init; }
        public DateOnly? Date { get; init; }
    }
}
