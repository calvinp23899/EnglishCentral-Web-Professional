using FluentValidation;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.CreateCourseCategory
{
    public class CourseCategoryCommandValidator : AbstractValidator<CreateCourseCategoryCommand>
    {
        public CourseCategoryCommandValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(20);
            RuleFor(x => x.Description).MaximumLength(250);
        }
    }
}
