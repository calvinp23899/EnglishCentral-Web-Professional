using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Courses.Commands.DeleteCourse
{
    public record DeleteCourseCommand(long Id) : IRequest<Result<bool>>;
}
