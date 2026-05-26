using EnglishCentral.Application.Features.Academic.ClassSchedules.DTOs;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSchedules.Commands.UpdateClassSchedule
{
    public record UpdateClassScheduleCommand(
        long Id,
        long ClassId,
        DayOfWeek DayOfWeek,
        TimeOnly StartTime,
        TimeOnly EndTime,
        DateOnly EffectiveFrom,
        DateOnly EffectiveTo) : IRequest<Result<ClassScheduleResponse>>;

    public class UpdateClassScheduleCommandValidator : AbstractValidator<UpdateClassScheduleCommand>
    {
        public UpdateClassScheduleCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.ClassId).GreaterThan(0);
            RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime);
            RuleFor(x => x.EffectiveTo).GreaterThanOrEqualTo(x => x.EffectiveFrom);
        }
    }
}
