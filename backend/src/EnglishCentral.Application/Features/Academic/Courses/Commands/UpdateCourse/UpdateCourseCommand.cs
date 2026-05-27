using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.UpdateCourse
{
    public record UpdateCourseCommand(
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
        bool IsActive) : IRequest<Result<CourseResponse>>;

    public class UpdateCourseCommandValidator : AbstractValidator<UpdateCourseCommand>
    {
        public UpdateCourseCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.CourseCategoryId).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(2000);
            RuleFor(x => x.Level).MaximumLength(100);
            RuleFor(x => x.TuitionFee).GreaterThanOrEqualTo(0);
        }
    }
}
