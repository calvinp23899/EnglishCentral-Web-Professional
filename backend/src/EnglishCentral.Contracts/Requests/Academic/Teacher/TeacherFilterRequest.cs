using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;

namespace EnglishCentral.Contracts.Requests.Academic.Teacher
{
    public record TeacherFilterRequest : PaginationRequest
    {
        public new EColumnSortGetTeacher? SortBy { get; init; }
        public EOrderSort OrderSort { get; init; } = EOrderSort.Descending;
        public ETeacherStatus? Status { get; init; }
        public DateOnly? HireDate { get; init; }
        public string? Role { get; init; }
    }
}
