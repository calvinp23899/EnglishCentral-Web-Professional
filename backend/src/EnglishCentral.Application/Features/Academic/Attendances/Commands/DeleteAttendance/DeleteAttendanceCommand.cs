using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.DeleteAttendance
{
    public record DeleteAttendanceCommand(long Id) : IRequest<Result<bool>>;
}
