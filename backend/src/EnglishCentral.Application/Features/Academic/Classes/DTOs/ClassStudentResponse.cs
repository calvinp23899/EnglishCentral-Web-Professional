using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Domain.Enums.Finance;

namespace EnglishCentral.Application.Features.Academic.Classes.DTOs
{
    public record ClassStudentResponse(
        long StudentId,
        long EnrollmentId,
        long? PaymentPlanId,
        string StudentCode,
        string FullName,
        string? PhoneNumber,
        string? Email,
        EStatus Status,
        EPaymentPlanType? PaymentPlanType,
        string? PlanFee
    );
}
