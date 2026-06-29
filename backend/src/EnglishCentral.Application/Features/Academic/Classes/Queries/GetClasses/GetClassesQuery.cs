using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Classes.Queries.GetClasses
{
    public record GetClassesQuery : IRequest<Result<PagedResult<ClassResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Keyword { get; init; }
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
        public long? CourseId { get; init; }
        public long? TeacherId { get; init; }
        public EClassStatus? Status { get; init; }
    }
}
