using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Features.Academic.Classes.DTOs
{
    public record ClassStudentResponse(
        string StudentCode,
        string FullName,
        string? PhoneNumber,
        string? Email,
        EStatus Status
    );
}
