using EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.UpdateClassSchedule
{
    public class UpdateClassScheduleCommandHandler : IRequestHandler<UpdateClassScheduleCommand, Result<ClassScheduleResponse>>
    {
        private readonly IAcademicRepository<ClassSchedule> _repository;

        public UpdateClassScheduleCommandHandler(IAcademicRepository<ClassSchedule> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ClassScheduleResponse>> Handle(UpdateClassScheduleCommand request, CancellationToken ct)
        {
            var schedule = await _repository.GetByIdAsync(request.Id, ct);
            if (schedule is null)
                return Result<ClassScheduleResponse>.Failure("Class schedule is not found.", 404);

            schedule.ClassId = request.ClassId;
            schedule.DayOfWeek = request.DayOfWeek;
            schedule.StartTime = request.StartTime;
            schedule.EndTime = request.EndTime;
            schedule.EffectiveFrom = request.EffectiveFrom;
            schedule.EffectiveTo = request.EffectiveTo;
            schedule.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<ClassScheduleResponse>.Success(schedule.ToResponse());
        }
    }
}
