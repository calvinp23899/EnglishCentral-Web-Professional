using FluentValidation;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.CreateCourse
{
    public class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
    {
        public CreateCourseCommandValidator()
        {
            RuleFor(x => x.CourseCategoryId).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Description).MaximumLength(500);
            RuleFor(x => x.Level).MaximumLength(100);
            RuleFor(x => x.DurationWeeks).GreaterThanOrEqualTo(0);
            RuleFor(x => x.TotalSessions).GreaterThanOrEqualTo(0);
            RuleFor(x => x.SessionDurationMinutes).GreaterThanOrEqualTo(0);
            RuleFor(x => x.TuitionFee).GreaterThanOrEqualTo(0);
            RuleFor(x => x.MaxStudents).GreaterThanOrEqualTo(0);
        }
    }
}
