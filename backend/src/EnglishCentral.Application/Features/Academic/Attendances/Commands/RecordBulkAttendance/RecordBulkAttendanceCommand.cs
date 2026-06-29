using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Attendances.Commands.RecordBulkAttendance
{
    public record RecordBulkAttendanceCommand(
        long SessionId,
        long? RecordedBy,
        DateTimeOffset? RecordedAt,
        IReadOnlyList<RecordBulkAttendanceItem> Items) : IRequest<Result<bool>>;

    public record RecordBulkAttendanceItem(
        long StudentId,
        EAttendanceStatus Status,
        DateTimeOffset? CheckedAt,
        long? CheckedBy,
        string? AbsenceReason,
        string? Notes);

    public class RecordBulkAttendanceCommandValidator : AbstractValidator<RecordBulkAttendanceCommand>
    {
        public RecordBulkAttendanceCommandValidator()
        {
            RuleFor(x => x.SessionId).GreaterThan(0);
            RuleFor(x => x.Items).NotEmpty();
            RuleForEach(x => x.Items).ChildRules(item =>
            {
                item.RuleFor(x => x.StudentId).GreaterThan(0);
                item.RuleFor(x => x.Status).IsInEnum();
                item.RuleFor(x => x.AbsenceReason).MaximumLength(1000);
                item.RuleFor(x => x.Notes).MaximumLength(1000);
            });
        }
    }
}
