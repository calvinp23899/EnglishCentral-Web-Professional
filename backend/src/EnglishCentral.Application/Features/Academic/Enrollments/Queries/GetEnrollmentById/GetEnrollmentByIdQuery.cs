using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Queries.GetEnrollmentById
{
    public record GetEnrollmentByIdQuery(long Id) : IRequest<Result<EnrollmentResponse>>;
}
