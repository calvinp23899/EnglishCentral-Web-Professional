using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.UpdateCourseCategory
{
    public class UpdateCourseCategoryCommandHandler : IRequestHandler<UpdateCourseCategoryCommand, Result<CourseCategoryResponse>>
    {
        private readonly IAcademicRepository<CourseCategory> _repository;

        public UpdateCourseCategoryCommandHandler(IAcademicRepository<CourseCategory> repository)
        {
            _repository = repository;
        }

        public async Task<Result<CourseCategoryResponse>> Handle(UpdateCourseCategoryCommand request, CancellationToken ct)
        {
            var category = await _repository.GetByIdAsync(request.Id, ct);
            if (category is null)
                return Result<CourseCategoryResponse>.Failure("Course category is not found.", 404);

            var code = request.Code.Trim();
            if (await _repository.ExistsAsync(x => x.Id != request.Id && x.Code == code, ct))
                return Result<CourseCategoryResponse>.Failure("Course category code already exists.", 409);

            category.Code = code;
            category.Name = request.Name.Trim();
            category.Description = request.Description?.Trim();
            category.IsActive = request.IsActive;
            category.UpdatedAt = DateTimeOffset.UtcNow;

            return Result<CourseCategoryResponse>.Success(category.ToResponse());
        }
    }
}
