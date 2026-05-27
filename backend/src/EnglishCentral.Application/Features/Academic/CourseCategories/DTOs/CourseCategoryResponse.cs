using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.DTOs
{
    public record CourseCategoryResponse(
        Guid PublicId,
        long Id,
        string Code,
        string Name,
        string? Description,
        bool IsActive);

    public static class CourseCategoryMapping
    {
        public static CourseCategoryResponse ToResponse(this CourseCategory category)
        {
            return new CourseCategoryResponse(
                category.PublicId,
                category.Id,
                category.Code,
                category.Name,
                category.Description,
                category.IsActive);
        }
    }
}
