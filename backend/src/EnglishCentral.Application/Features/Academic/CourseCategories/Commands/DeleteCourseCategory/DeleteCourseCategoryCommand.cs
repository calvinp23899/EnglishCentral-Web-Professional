using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Commands.DeleteCourseCategory
{
    public record DeleteCourseCategoryCommand(long Id) : IRequest<Result<bool>>;
}
