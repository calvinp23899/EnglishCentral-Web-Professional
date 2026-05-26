using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.DeleteClassSchedule
{
    public record DeleteClassScheduleCommand(long Id) : IRequest<Result<bool>>;
}
