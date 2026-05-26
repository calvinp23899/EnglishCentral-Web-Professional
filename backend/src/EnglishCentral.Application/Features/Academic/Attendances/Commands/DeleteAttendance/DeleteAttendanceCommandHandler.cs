using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.DeleteAttendance
{
    public class DeleteAttendanceCommandHandler : IRequestHandler<DeleteAttendanceCommand, Result<bool>>
    {
        private readonly IAcademicRepository<Attendance> _repository;

        public DeleteAttendanceCommandHandler(IAcademicRepository<Attendance> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteAttendanceCommand request, CancellationToken ct)
        {
            var attendance = await _repository.GetByIdAsync(request.Id, ct);
            if (attendance is null)
                return Result<bool>.Failure("Attendance is not found.", 404);

            attendance.IsDeleted = true;
            attendance.DeletedAt = DateTimeOffset.UtcNow;
            attendance.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
