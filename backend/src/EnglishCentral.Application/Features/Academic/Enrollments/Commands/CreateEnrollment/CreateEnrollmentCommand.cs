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
        EEnrollmentStatus Status,
        decimal TuitionFee,
        decimal DiscountAmount,
        decimal FinalAmount,
        decimal PaidAmount,
        decimal OutstandingAmount,
        string? CancellationReason,
        DateTimeOffset? CancelledAt,
        long? CancelledBy,
        string? Notes,
        IReadOnlyCollection<CreateEnrollmentDiscountRequest>? Discounts = null,
        CreateEnrollmentPaymentPlanRequest? PaymentPlan = null) : IRequest<Result<EnrollmentResponse>>;

    public record CreateEnrollmentDiscountRequest(
        long? DiscountId,
        string? Name,
        EDiscountType Type,
        decimal Value,
        decimal? Amount,
        string? Reason);

    public record CreateEnrollmentPaymentPlanRequest(
        long? BillingPolicyId,
        EPaymentPlanType Type,
        int? NumberOfInstallments,
        string? Notes,
        IReadOnlyCollection<CreateEnrollmentPaymentPlanItemRequest> Items);

    public record CreateEnrollmentPaymentPlanItemRequest(
        int SequenceNumber,
        string Name,
        DateOnly DueDate,
        decimal Amount);

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
            RuleForEach(x => x.Discounts).ChildRules(discount =>
            {
                discount.RuleFor(x => x.DiscountId).GreaterThan(0).When(x => x.DiscountId.HasValue);
                discount.RuleFor(x => x.Name).MaximumLength(255);
                discount.RuleFor(x => x.Type).IsInEnum();
                discount.RuleFor(x => x.Value).GreaterThan(0);
                discount.RuleFor(x => x.Amount).GreaterThan(0).When(x => x.Amount.HasValue);
                discount.RuleFor(x => x.Reason).MaximumLength(1000);
            }).When(x => x.Discounts is not null);
            RuleFor(x => x.PaymentPlan!.Type).IsInEnum().When(x => x.PaymentPlan is not null);
            RuleFor(x => x.PaymentPlan!.Items).NotEmpty().When(x => x.PaymentPlan is not null);
            RuleForEach(x => x.PaymentPlan!.Items).ChildRules(item =>
            {
                item.RuleFor(x => x.SequenceNumber).GreaterThan(0);
                item.RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
                item.RuleFor(x => x.Amount).GreaterThan(0);
            }).When(x => x.PaymentPlan is not null);
        }
    }
}
