using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Queries.GetCourseById
{
    public record GetCourseByIdQuery(long Id) : IRequest<Result<CourseResponse>>;
}
