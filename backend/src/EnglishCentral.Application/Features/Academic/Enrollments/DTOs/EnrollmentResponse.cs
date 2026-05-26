using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.Enrollments.DTOs
{
    public record EnrollmentResponse(
        Guid PublicId,
        long Id,
        long StudentId,
        long ClassId,
        string EnrollmentCode,
        DateTimeOffset EnrolledAt,
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
        string? Notes);

    public static class EnrollmentMapping
    {
        public static EnrollmentResponse ToResponse(this Enrollment enrollment)
        {
            return new EnrollmentResponse(
                enrollment.PublicId,
                enrollment.Id,
                enrollment.StudentId,
                enrollment.ClassId,
                enrollment.EnrollmentCode,
                enrollment.EnrolledAt,
                enrollment.StartDate,
                enrollment.EndDate,
                enrollment.Status,
                enrollment.TuitionFee,
                enrollment.DiscountAmount,
                enrollment.FinalAmount,
                enrollment.PaidAmount,
                enrollment.OutstandingAmount,
                enrollment.CancellationReason,
                enrollment.CancelledAt,
                enrollment.CancelledBy,
                enrollment.Notes);
        }
    }
}
