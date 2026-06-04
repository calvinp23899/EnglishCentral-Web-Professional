using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.CreateCourse
{
    public record CreateCourseCommand(
        long CourseCategoryId,
        long? DefaultBillingPolicyId,
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
        bool IsActive = true)
    : IRequest<Result<CourseResponse>>;
}
