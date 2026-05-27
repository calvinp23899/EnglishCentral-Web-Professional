using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.DeleteCourse
{
    public class DeleteCourseCommandHandler : IRequestHandler<DeleteCourseCommand, Result<bool>>
    {
        private readonly IAcademicRepository<Course> _repository;

        public DeleteCourseCommandHandler(IAcademicRepository<Course> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteCourseCommand request, CancellationToken ct)
        {
            var course = await _repository.GetByIdAsync(request.Id, ct);
            if (course is null)
                return Result<bool>.Failure("Course is not found.", 404);

            course.IsDeleted = true;
            course.DeletedAt = DateTimeOffset.UtcNow;
            course.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
