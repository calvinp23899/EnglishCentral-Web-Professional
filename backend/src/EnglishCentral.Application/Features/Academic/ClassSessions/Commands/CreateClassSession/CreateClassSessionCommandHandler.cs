using EnglishCentral.Application.Features.Academic.ClassSessions.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Commands.CreateClassSession
{
    public class CreateClassSessionCommandHandler : IRequestHandler<CreateClassSessionCommand, Result<ClassSessionResponse>>
    {
        private readonly IAcademicRepository<ClassSession> _repository;
        private readonly IAcademicRepository<AcademicClass> _classRepository;

        public CreateClassSessionCommandHandler(IAcademicRepository<ClassSession> repository, IAcademicRepository<AcademicClass> classRepository)
        {
            _repository = repository;
            _classRepository = classRepository;
        }

        public async Task<Result<ClassSessionResponse>> Handle(CreateClassSessionCommand request, CancellationToken ct)
        {
            if (!await _classRepository.ExistsAsync(x => x.Id == request.ClassId, ct))
                return Result<ClassSessionResponse>.Failure("Class is not found.", 404);

            if (await _repository.ExistsAsync(x => x.ClassId == request.ClassId && x.SessionNumber == request.SessionNumber, ct))
                return Result<ClassSessionResponse>.Failure("Session number already exists in this class.", 409);

            var session = new ClassSession
            {
                ClassId = request.ClassId,
                TeacherId = request.TeacherId,
                SubstituteTeacherId = request.SubstituteTeacherId,
                RoomId = request.RoomId,
                SessionNumber = request.SessionNumber,
                SessionDate = request.SessionDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                StartedAt = request.StartedAt,
                EndedAt = request.EndedAt,
                Status = request.Status,
                CancellationReason = request.CancellationReason?.Trim(),
                IsPayrollLocked = request.IsPayrollLocked,
                Notes = request.Notes?.Trim(),
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(session, ct);
            return Result<ClassSessionResponse>.Success(session.ToResponse(), 201);
        }
    }
}
