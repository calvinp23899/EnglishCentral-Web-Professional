using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Queries.GetTeacher
{
    public class GetTeachersQuery : IRequest<Result<PagedResult<TeacherResponse>>>
    {
        public int Page { get; init; }

        public int PageSize { get; init; }

        public string? Keyword { get; init; }

        public EColumnSortGetTeacher? SortBy { get; init; }
        public EOrderSort OrderSort { get; init; } = EOrderSort.Descending;

        public ETeacherStatus? Status { get; init; }
        public DateOnly? Date { get; init; }
        public string? Role { get; init; }
    }
}
