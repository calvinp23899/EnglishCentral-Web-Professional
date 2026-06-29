using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Queries.GetCourseById
{
    public class GetCourseByIdQueryHandler : IRequestHandler<GetCourseByIdQuery, Result<CourseResponse>>
    {
        private readonly IAcademicRepository<Course> _repository;

        public GetCourseByIdQueryHandler(IAcademicRepository<Course> repository)
        {
            _repository = repository;
        }

        public async Task<Result<CourseResponse>> Handle(GetCourseByIdQuery request, CancellationToken ct)
        {
            var course = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return course is null
                ? Result<CourseResponse>.Failure("Course is not found.", 404)
                : Result<CourseResponse>.Success(course.ToResponse());
        }
    }
}
