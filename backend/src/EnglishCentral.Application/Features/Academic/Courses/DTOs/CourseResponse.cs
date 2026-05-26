using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Features.Academic.Courses.DTOs
{
    public record CourseResponse(
        Guid PublicId,
        long Id,
        long CourseCategoryId,
        string Code,
        string Name,
        string? Description,
        string? Level,
        int DurationWeeks,
        int TotalSessions,
        int SessionDurationMinutes,
        decimal TuitionFee,
        int MaxStudents,
        int DisplayOrder,
        bool IsPublished,
        bool IsActive);

    public static class CourseMapping
    {
        public static CourseResponse ToResponse(this Course course)
        {
            return new CourseResponse(
                course.PublicId,
                course.Id,
                course.CourseCategoryId,
                course.Code,
                course.Name,
                course.Description,
                course.Level,
                course.DurationWeeks,
                course.TotalSessions,
                course.SessionDurationMinutes,
                course.TuitionFee,
                course.MaxStudents,
                course.DisplayOrder,
                course.IsPublished,
                course.IsActive);
        }
    }
}
