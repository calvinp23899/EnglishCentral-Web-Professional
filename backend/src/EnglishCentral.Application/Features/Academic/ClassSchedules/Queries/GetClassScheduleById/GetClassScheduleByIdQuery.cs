using EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Queries.GetClassScheduleById
{
    public record GetClassScheduleByIdQuery(long Id) : IRequest<Result<ClassScheduleResponse>>;
}
