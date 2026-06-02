using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.Students.DTOs
{
    public record StudentEnrollmentOptionResponse(
        long StudentId,
        string StudentCode,
        string FullName,
        string? PhoneNumber,
        string? Email,
        EStatus Status
    );
}
