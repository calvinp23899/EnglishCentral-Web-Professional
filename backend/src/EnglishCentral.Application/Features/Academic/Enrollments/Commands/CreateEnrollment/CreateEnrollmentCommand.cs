using EnglishCentral.Application.Features.Academic.Enrollments.DTOs;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Shared.Results;
using FluentValidation;
using MediatR;

namespace EnglishCentral.Application.Features.Academic.Enrollments.Commands.CreateEnrollment
{
    public record CreateEnrollmentCommand(
        long StudentId,
        long ClassId,
        string? EnrollmentCode,
        DateTimeOffset? EnrolledAt,
        DateOnly? StartDate,
        DateOnly? EndDate,
        EnrollmentStatus Status,
        decimal TuitionFee,
        decimal DiscountAmount,
        decimal FinalAmount,
        decimal PaidAmount,
        decimal OutstandingAmount,
        string? CancellationReason,
        DateTimeOffset? CancelledAt,
        long? CancelledBy,
        string? Notes) : IRequest<Result<EnrollmentResponse>>;

    public class CreateEnrollmentCommandValidator : AbstractValidator<CreateEnrollmentCommand>
    {
        public CreateEnrollmentCommandValidator()
        {
            RuleFor(x => x.StudentId).GreaterThan(0);
            RuleFor(x => x.ClassId).GreaterThan(0);
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
