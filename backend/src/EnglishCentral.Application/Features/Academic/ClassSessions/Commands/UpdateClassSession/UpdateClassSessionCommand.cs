using EnglishCentral.Application.Features.Academic.ClassSessions.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.ClassSessions.Commands.UpdateClassSession
{
    public record UpdateClassSessionCommand(
        long Id,
        long ClassId,
        long TeacherId,
        long? SubstituteTeacherId,
        long RoomId,
        int SessionNumber,
        DateOnly SessionDate,
        TimeOnly StartTime,
        TimeOnly EndTime,
        DateTimeOffset? StartedAt,
        DateTimeOffset? EndedAt,
        SessionStatus Status,
        string? CancellationReason,
        bool IsPayrollLocked,
        string? Notes) : IRequest<Result<ClassSessionResponse>>;

    public class UpdateClassSessionCommandValidator : AbstractValidator<UpdateClassSessionCommand>
    {
        public UpdateClassSessionCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.ClassId).GreaterThan(0);
            RuleFor(x => x.TeacherId).GreaterThan(0);
            RuleFor(x => x.RoomId).GreaterThan(0);
            RuleFor(x => x.SessionNumber).GreaterThan(0);
            RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime);
            RuleFor(x => x.Status).IsInEnum();
            RuleFor(x => x.CancellationReason).MaximumLength(1000);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
