using EnglishCentral.Application.Features.Academic.ClassSessions.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Commands.UpdateClassSession
{
    public class UpdateClassSessionCommandHandler : IRequestHandler<UpdateClassSessionCommand, Result<ClassSessionResponse>>
    {
        private readonly IAcademicRepository<ClassSession> _repository;

        public UpdateClassSessionCommandHandler(IAcademicRepository<ClassSession> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ClassSessionResponse>> Handle(UpdateClassSessionCommand request, CancellationToken ct)
        {
            var session = await _repository.GetByIdAsync(request.Id, ct);
            if (session is null)
                return Result<ClassSessionResponse>.Failure("Class session is not found.", 404);

            session.ClassId = request.ClassId;
            session.TeacherId = request.TeacherId;
            session.SubstituteTeacherId = request.SubstituteTeacherId;
            session.RoomId = request.RoomId;
            session.SessionNumber = request.SessionNumber;
            session.SessionDate = request.SessionDate;
            session.StartTime = request.StartTime;
            session.EndTime = request.EndTime;
            session.StartedAt = request.StartedAt;
            session.EndedAt = request.EndedAt;
            session.Status = request.Status;
            session.CancellationReason = request.CancellationReason?.Trim();
            session.IsPayrollLocked = request.IsPayrollLocked;
            session.Notes = request.Notes?.Trim();
            session.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<ClassSessionResponse>.Success(session.ToResponse());
        }
    }
}
