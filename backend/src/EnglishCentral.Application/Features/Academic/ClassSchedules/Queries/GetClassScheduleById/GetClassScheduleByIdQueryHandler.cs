using EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs;
using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Queries.GetClassScheduleById
{
    public class GetClassScheduleByIdQueryHandler : IRequestHandler<GetClassScheduleByIdQuery, Result<ClassScheduleResponse>>
    {
        private readonly IAcademicRepository<ClassSchedule> _repository;

        public GetClassScheduleByIdQueryHandler(IAcademicRepository<ClassSchedule> repository)
        {
            _repository = repository;
        }

        public async Task<Result<ClassScheduleResponse>> Handle(GetClassScheduleByIdQuery request, CancellationToken ct)
        {
            var schedule = await _repository.FirstOrDefaultAsync(x => x.Id == request.Id, ct);
            return schedule is null
                ? Result<ClassScheduleResponse>.Failure("Class schedule is not found.", 404)
                : Result<ClassScheduleResponse>.Success(schedule.ToResponse());
        }
    }
}
