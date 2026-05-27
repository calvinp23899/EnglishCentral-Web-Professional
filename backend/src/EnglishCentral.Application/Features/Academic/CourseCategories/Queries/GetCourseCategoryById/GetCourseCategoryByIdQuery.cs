using EnglishCentral.Application.Features.Academic.CourseCategories.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.CourseCategories.Queries.GetCourseCategoryById
{
    public record GetCourseCategoryByIdQuery(long Id) : IRequest<Result<CourseCategoryResponse>>;
}
