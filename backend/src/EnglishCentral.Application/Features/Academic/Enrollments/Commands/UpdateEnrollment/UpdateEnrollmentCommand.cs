using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.UpdateEnrollment
{
    public record UpdateEnrollmentCommand(
        long Id,
        string? EnrollmentCode,
        DateOnly? StartDate,
        DateOnly? EndDate,
        EEnrollmentStatus Status,
        decimal TuitionFee,
        decimal DiscountAmount,
        decimal FinalAmount,
        decimal PaidAmount,
        decimal OutstandingAmount,
        string? CancellationReason,
        DateTimeOffset? CancelledAt,
        long? CancelledBy,
        string? Notes) : IRequest<Result<EnrollmentResponse>>;

    public class UpdateEnrollmentCommandValidator : AbstractValidator<UpdateEnrollmentCommand>
    {
        public UpdateEnrollmentCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.EnrollmentCode).MaximumLength(50);
            RuleFor(x => x.Status).IsInEnum();
            RuleFor(x => x.TuitionFee).GreaterThanOrEqualTo(0);
            RuleFor(x => x.DiscountAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.FinalAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.OutstandingAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.CancellationReason).MaximumLength(1000);
            RuleFor(x => x.Notes).MaximumLength(2000);
        }
    }
}
