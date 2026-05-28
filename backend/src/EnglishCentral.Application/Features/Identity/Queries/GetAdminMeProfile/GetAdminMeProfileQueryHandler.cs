using EnglishCentral.Application.Features.Academic.Teachers.DTOs;
using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetAdminMeProfile
{
    public class GetAdminMeProfileQueryHandler : IRequestHandler<GetAdminMeProfileQuery, Result<AdminMeProfileResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITeacherRepository _teacherRepository;

        public GetAdminMeProfileQueryHandler(
            IUserRepository userRepository,
            ITeacherRepository teacherRepository)
        {
            _userRepository = userRepository;
            _teacherRepository = teacherRepository;
        }

        public async Task<Result<AdminMeProfileResponse>> Handle(GetAdminMeProfileQuery request, CancellationToken ct)
        {
            var user = await _userRepository.GetByPublicIdAsync(request.UserPublicId, ct);
            if (user is null)
            {
                return Result<AdminMeProfileResponse>.Failure("Account not found.", 404);
            }

            var teacher = await _teacherRepository.GetMeProfileByUserPublicIdAsync(request.UserPublicId, ct);

            return Result<AdminMeProfileResponse>.Success(new AdminMeProfileResponse(
                user.PublicId,
                user.Email,
                user.PhoneNumber,
                user.FullName,
                teacher?.ToResponse()));
        }
    }
}
