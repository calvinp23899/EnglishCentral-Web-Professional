using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Students.Commands.DeleteStudent
{
    public record DeleteStudentCommand(long Id) : IRequest<Result<bool>>;
}
