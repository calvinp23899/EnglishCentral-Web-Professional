using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;

namespace EnglishCentral.Contracts.Requests.Academic.Teacher
{
    public record TeacherFilterRequest : PaginationRequest
    {
        public ETeacherStatus? Status { get; init; }
        public DateOnly? HireDate { get; init; }
    }
}
