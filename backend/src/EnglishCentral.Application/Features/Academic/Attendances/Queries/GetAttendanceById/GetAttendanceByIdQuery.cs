using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Queries.GetAttendanceById
{
    public record GetAttendanceByIdQuery(long Id) : IRequest<Result<AttendanceResponse>>;
}
