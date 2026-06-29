using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Common.PaginationHelpers;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Queries.GetEnrollments
{
    public record GetEnrollmentsQuery : IRequest<Result<PagedResult<EnrollmentResponse>>>
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public bool IsDescending { get; init; } = true;
        public long? StudentId { get; init; }
        public long? ClassId { get; init; }
        public EEnrollmentStatus? Status { get; init; }
    }
}
