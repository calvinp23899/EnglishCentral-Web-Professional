using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.CreateCourseCategory
{
    public record CreateCourseCategoryCommand(
        string Name,
        string? Description,
        bool IsActive = true)
    : IRequest<Result<CourseCategoryResponse>>;
}
