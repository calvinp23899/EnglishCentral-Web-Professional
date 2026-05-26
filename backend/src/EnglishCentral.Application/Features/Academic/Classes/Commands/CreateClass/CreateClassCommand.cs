using EnglishCentral.Application.Features.Academic.Classes.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Classes.Commands.CreateClass
{
    public record CreateClassCommand(
        long CourseId,
        long TeacherId,
        long? RoomId,
        string Code,
        string Name,
        DateOnly StartDate,
        DateOnly EndDate,
        int Capacity,
        decimal? TuitionFeeSnapshot,
        int? TotalSessions,
        int CompletedSessions,
        ClassStatus Status,
        DateTimeOffset? OpenedAt,
        DateTimeOffset? ClosedAt,
        string? Notes) : IRequest<Result<ClassResponse>>;

    public class CreateClassCommandValidator : AbstractValidator<CreateClassCommand>
    {
        public CreateClassCommandValidator()
        {
            RuleFor(x => x.CourseId).GreaterThan(0);
            RuleFor(x => x.TeacherId).GreaterThan(0);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
            RuleFor(x => x.Capacity).GreaterThan(0);
            RuleFor(x => x.Status).IsInEnum();
            RuleFor(x => x.Notes).MaximumLength(2000);
            RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate);
        }
    }
}
