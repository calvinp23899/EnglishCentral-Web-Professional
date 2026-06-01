using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.CreateCourseCategory
{
    public class CreateCourseCategoryCommandHandler : IRequestHandler<CreateCourseCategoryCommand, Result<CourseCategoryResponse>>
    {
        private readonly IAcademicRepository<CourseCategory> _repository;
        private readonly ICodeGenerator _codeGenService;

        public CreateCourseCategoryCommandHandler(IAcademicRepository<CourseCategory> repository, ICodeGenerator codeGenService)
        {
            _repository = repository;
            _codeGenService = codeGenService;
        }

        public async Task<Result<CourseCategoryResponse>> Handle(CreateCourseCategoryCommand request, CancellationToken ct)
        {
            string CourseCodeCustom = $"C-CRS-{_codeGenService.GenerateCode()}";
            if (await _repository.ExistsAsync(x => x.Code == CourseCodeCustom, ct))
                return Result<CourseCategoryResponse>.Failure("Course category code already exists.", 409);
            var category = new CourseCategory
            {
                Code = CourseCodeCustom,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                IsActive = request.IsActive
            };
            await _repository.AddAsync(category, ct);
            return Result<CourseCategoryResponse>.Success(category.ToResponse(), 201);
        }
    }
}
