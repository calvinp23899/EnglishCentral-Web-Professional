using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.CreateCourseCategory
{
    public class CreateCourseCategoryCommandHandler : IRequestHandler<CreateCourseCategoryCommand, Result<CourseCategoryResponse>>
    {
        private readonly IAcademicRepository<CourseCategory> _repository;

        public CreateCourseCategoryCommandHandler(IAcademicRepository<CourseCategory> repository)
        {
            _repository = repository;
        }

        public async Task<Result<CourseCategoryResponse>> Handle(CreateCourseCategoryCommand request, CancellationToken ct)
        {
            var code = request.Code.Trim();
            if (await _repository.ExistsAsync(x => x.Code == code, ct))
                return Result<CourseCategoryResponse>.Failure("Course category code already exists.", 409);

            var category = new CourseCategory
            {
                Code = code,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(category, ct);
            return Result<CourseCategoryResponse>.Success(category.ToResponse(), 201);
        }
    }
}
