using EnglishCentral.Application.Features.Academic.Courses.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.CreateCourse
{
    public record CreateCourseCommand(
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
        bool IsActive = true) : IRequest<Result<CourseResponse>>;

    public class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
    {
        public CreateCourseCommandValidator()
        {
            RuleFor(x => x.CourseCategoryId).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(2000);
            RuleFor(x => x.Level).MaximumLength(100);
            RuleFor(x => x.DurationWeeks).GreaterThanOrEqualTo(0);
            RuleFor(x => x.TotalSessions).GreaterThanOrEqualTo(0);
            RuleFor(x => x.SessionDurationMinutes).GreaterThanOrEqualTo(0);
            RuleFor(x => x.TuitionFee).GreaterThanOrEqualTo(0);
            RuleFor(x => x.MaxStudents).GreaterThanOrEqualTo(0);
        }
    }
}
