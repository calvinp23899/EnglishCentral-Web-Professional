using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.CreateCourseCategory
{
    public record CreateCourseCategoryCommand(
        string Code,
        string Name,
        string? Description,
        bool IsActive = true) : IRequest<Result<CourseCategoryResponse>>;

    public class CreateCourseCategoryCommandValidator : AbstractValidator<CreateCourseCategoryCommand>
    {
        public CreateCourseCategoryCommandValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(1000);
        }
    }
}
