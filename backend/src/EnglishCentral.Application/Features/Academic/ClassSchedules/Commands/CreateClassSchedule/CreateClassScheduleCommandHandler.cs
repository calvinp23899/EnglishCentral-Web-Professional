using EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;
using AcademicClass = EnglishCentral.Domain.Entities.Academic.Class;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.CreateClassSchedule
{
    public class CreateClassScheduleCommandHandler : IRequestHandler<CreateClassScheduleCommand, Result<ClassScheduleResponse>>
    {
        private readonly IAcademicRepository<ClassSchedule> _repository;
        private readonly IAcademicRepository<AcademicClass> _classRepository;

        public CreateClassScheduleCommandHandler(IAcademicRepository<ClassSchedule> repository, IAcademicRepository<AcademicClass> classRepository)
        {
            _repository = repository;
            _classRepository = classRepository;
        }

        public async Task<Result<ClassScheduleResponse>> Handle(CreateClassScheduleCommand request, CancellationToken ct)
        {
            if (!await _classRepository.ExistsAsync(x => x.Id == request.ClassId, ct))
                return Result<ClassScheduleResponse>.Failure("Class is not found.", 404);

            var schedule = new ClassSchedule
            {
                ClassId = request.ClassId,
                DayOfWeek = request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                EffectiveFrom = request.EffectiveFrom,
                EffectiveTo = request.EffectiveTo,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _repository.AddAsync(schedule, ct);
            return Result<ClassScheduleResponse>.Success(schedule.ToResponse(), 201);
        }
    }
}
