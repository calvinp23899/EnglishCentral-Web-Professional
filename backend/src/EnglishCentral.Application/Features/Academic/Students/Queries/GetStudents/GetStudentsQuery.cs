using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Queries.GetStudents
{
    public record GetStudentsQuery : IRequest<Result<PagedResult<StudentResponse>>>
    {
        public int Page { get; init; }

        public int PageSize { get; init; }

        public string? Keyword { get; init; }

        public string? SortBy { get; init; }

        public bool IsDescending { get; init; } = true;

        public EStatus? Status { get; init; }

        public DateOnly? Date { get; init; }
    };
}
