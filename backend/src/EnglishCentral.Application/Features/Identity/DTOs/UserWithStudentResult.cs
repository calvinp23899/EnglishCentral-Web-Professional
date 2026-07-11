using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Features.Identity.DTOs
{
    public record UserWithStudentResult(
        User User,
        Student? Student
    );
}
