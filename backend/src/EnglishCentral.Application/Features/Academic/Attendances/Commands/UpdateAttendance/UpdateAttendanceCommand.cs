using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.UpdateAttendance
{
    public record UpdateAttendanceCommand(
        long Id,
        long SessionId,
        long StudentId,
        EAttendanceStatus Status,
        DateTimeOffset? CheckedAt,
        long? CheckedBy,
        DateTimeOffset? RecordedAt,
        long? RecordedBy,
        string? AbsenceReason,
        string? Notes) : IRequest<Result<AttendanceResponse>>;

    public class UpdateAttendanceCommandValidator : AbstractValidator<UpdateAttendanceCommand>
    {
        public UpdateAttendanceCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.SessionId).GreaterThan(0);
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.Status).IsInEnum();
            RuleFor(x => x.AbsenceReason).MaximumLength(1000);
            RuleFor(x => x.Notes).MaximumLength(1000);
        }
    }
}
