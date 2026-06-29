using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;

namespace EnglishCentral.Contracts.Requests.Academic.Student
{
    public record StudentFilterRequest : PaginationRequest
    {
        public EStatus? Status { get; init; }
        public DateOnly? EnrollmentDate { get; init; }
        public string? SortBy { get; init; }
        public bool IsDescending { get; init; } = true;
    }
}
