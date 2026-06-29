using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Teachers.Commands.DeleteTeacher
{
    public record DeleteTeacherCommand(
        long TeacherId
    ) : IRequest<Result<bool>>;
}
