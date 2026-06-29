using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Queries.GetCourseCategoryById
{
    public class GetCourseCategoryByIdQueryHandler : IRequestHandler<GetCourseCategoryByIdQuery, Result<CourseCategoryResponse>>
    {
        private readonly IAcademicRepository<CourseCategory> _repository;

        public GetCourseCategoryByIdQueryHandler(IAcademicRepository<CourseCategory> repository)
        {
            _repository = repository;
        }

        public async Task<Result<CourseCategoryResponse>> Handle(GetCourseCategoryByIdQuery request, CancellationToken ct)
        {
            var category = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);

            return category is null
                ? Result<CourseCategoryResponse>.Failure("Course category is not found.", 404)
                : Result<CourseCategoryResponse>.Success(category.ToResponse());
        }
    }
}
