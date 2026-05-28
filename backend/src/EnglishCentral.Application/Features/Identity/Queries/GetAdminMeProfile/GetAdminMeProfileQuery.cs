using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetAdminMeProfile
{
    public record GetAdminMeProfileQuery(Guid UserPublicId) : IRequest<Result<AdminMeProfileResponse>>;

    public record AdminMeProfileResponse(
        Guid PublicId,
        string Email,
        string? PhoneNumber,
        string FullName,
        TeacherResponse? Teacher
    );
}
