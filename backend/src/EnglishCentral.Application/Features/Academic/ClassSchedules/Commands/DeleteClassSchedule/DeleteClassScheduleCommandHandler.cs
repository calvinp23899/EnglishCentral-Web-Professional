using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.DeleteClassSchedule
{
    public class DeleteClassScheduleCommandHandler : IRequestHandler<DeleteClassScheduleCommand, Result<bool>>
    {
        private readonly IAcademicRepository<ClassSchedule> _repository;

        public DeleteClassScheduleCommandHandler(IAcademicRepository<ClassSchedule> repository)
        {
            _repository = repository;
        }

        public async Task<Result<bool>> Handle(DeleteClassScheduleCommand request, CancellationToken ct)
        {
            var schedule = await _repository.GetByIdAsync(request.Id, ct);
            if (schedule is null)
                return Result<bool>.Failure("Class schedule is not found.", 404);

            schedule.IsDeleted = true;
            schedule.DeletedAt = DateTimeOffset.UtcNow;
            schedule.UpdatedAt = DateTimeOffset.UtcNow;
            return Result<bool>.Success(true);
        }
    }
}
