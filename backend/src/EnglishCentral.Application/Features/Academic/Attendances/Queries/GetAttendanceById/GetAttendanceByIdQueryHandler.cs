using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Queries.GetAttendanceById
{
    public class GetAttendanceByIdQueryHandler : IRequestHandler<GetAttendanceByIdQuery, Result<AttendanceResponse>>
    {
        private readonly IAcademicRepository<Attendance> _repository;

        public GetAttendanceByIdQueryHandler(IAcademicRepository<Attendance> repository)
        {
            _repository = repository;
        }

        public async Task<Result<AttendanceResponse>> Handle(GetAttendanceByIdQuery request, CancellationToken ct)
        {
            var attendance = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return attendance is null
                ? Result<AttendanceResponse>.Failure("Attendance is not found.", 404)
                : Result<AttendanceResponse>.Success(attendance.ToResponse());
        }
    }
}
