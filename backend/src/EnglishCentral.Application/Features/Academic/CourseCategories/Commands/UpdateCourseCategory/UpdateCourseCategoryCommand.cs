using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.UpdateCourseCategory
{
    public record UpdateCourseCategoryCommand(
        long Id,
        string Code,
        string Name,
        string? Description,
        bool IsActive) : IRequest<Result<CourseCategoryResponse>>;

    public class UpdateCourseCategoryCommandValidator : AbstractValidator<UpdateCourseCategoryCommand>
    {
        public UpdateCourseCategoryCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Description).MaximumLength(1000);
        }
    }
}
