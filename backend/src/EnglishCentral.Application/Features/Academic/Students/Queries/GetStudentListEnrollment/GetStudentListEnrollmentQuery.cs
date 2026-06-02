using EnglishCentral.Application.Features.Academic.Students.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Queries.GetStudentListEnrollment
{
    public record GetStudentListEnrollmentQuery(string? Search)
        : IRequest<Result<List<StudentEnrollmentOptionResponse>>>;
}
