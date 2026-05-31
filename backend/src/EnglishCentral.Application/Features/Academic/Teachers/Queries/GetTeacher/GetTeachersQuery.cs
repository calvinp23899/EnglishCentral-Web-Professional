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

        public string? SortBy { get; init; }

        public bool IsDescending { get; init; }

        public ETeacherStatus? Status { get; init; }
        public DateOnly? Date { get; init; }
        public string? Role { get; init; }
        public DateOnly? HireDateFrom { get; init; }
        public DateOnly? HireDateTo { get; init; }
    }
}
