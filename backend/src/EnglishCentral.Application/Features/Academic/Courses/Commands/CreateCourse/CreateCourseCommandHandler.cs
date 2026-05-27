using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.CreateCourse
{
    public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, Result<CourseResponse>>
    {
        private readonly IAcademicRepository<Course> _courseRepository;
        private readonly IAcademicRepository<CourseCategory> _categoryRepository;

        public CreateCourseCommandHandler(IAcademicRepository<Course> courseRepository, IAcademicRepository<CourseCategory> categoryRepository)
        {
            _courseRepository = courseRepository;
            _categoryRepository = categoryRepository;
        }

        public async Task<Result<CourseResponse>> Handle(CreateCourseCommand request, CancellationToken ct)
        {
            if (!await _categoryRepository.ExistsAsync(x => x.Id == request.CourseCategoryId, ct))
                return Result<CourseResponse>.Failure("Course category is not found.", 404);

            var code = request.Code.Trim();
            if (await _courseRepository.ExistsAsync(x => x.Code == code, ct))
                return Result<CourseResponse>.Failure("Course code already exists.", 409);

            var course = new Course
            {
                CourseCategoryId = request.CourseCategoryId,
                Code = code,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                Level = request.Level?.Trim(),
                DurationWeeks = request.DurationWeeks,
                TotalSessions = request.TotalSessions,
                SessionDurationMinutes = request.SessionDurationMinutes,
                TuitionFee = request.TuitionFee,
                MaxStudents = request.MaxStudents,
                DisplayOrder = request.DisplayOrder,
                IsPublished = request.IsPublished,
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _courseRepository.AddAsync(course, ct);
            return Result<CourseResponse>.Success(course.ToResponse(), 201);
        }
    }
}
