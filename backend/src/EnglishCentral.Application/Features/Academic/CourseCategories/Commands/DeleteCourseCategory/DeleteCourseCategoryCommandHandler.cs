using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.DeleteCourseCategory
{
    public class DeleteCourseCategoryCommandHandler : IRequestHandler<DeleteCourseCategoryCommand, Result<bool>>
    {
        private readonly IAcademicRepository<CourseCategory> _repository;

        public DeleteCourseCategoryCommandHandler(IAcademicRepository<CourseCategory> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteCourseCategoryCommand request, CancellationToken ct)
        {
            var category = await _repository.GetByIdAsync(request.Id, ct);
            if (category is null)
                return Result<bool>.Failure("Course category is not found.", 404);

            category.IsDeleted = true;
            category.DeletedAt = DateTimeOffset.UtcNow;
            category.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
