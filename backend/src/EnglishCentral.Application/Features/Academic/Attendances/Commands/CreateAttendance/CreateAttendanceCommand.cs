using EnglishCentral.Application.Features.Academic.Attendances.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.CreateAttendance
{
    public record CreateAttendanceCommand(
        long SessionId,
        long StudentId,
        EAttendanceStatus Status,
        DateTimeOffset? CheckedAt,
        long? CheckedBy,
        DateTimeOffset? RecordedAt,
        long? RecordedBy,
        string? AbsenceReason,
        string? Notes) : IRequest<Result<AttendanceResponse>>;

    public class CreateAttendanceCommandValidator : AbstractValidator<CreateAttendanceCommand>
    {
        public CreateAttendanceCommandValidator()
        {
            RuleFor(x => x.SessionId).GreaterThan(0);
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.Status).IsInEnum();
            RuleFor(x => x.AbsenceReason).MaximumLength(1000);
            RuleFor(x => x.Notes).MaximumLength(1000);
        }
    }
}
