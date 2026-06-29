using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetMe
{
    public class GetMeQueryHandler : IRequestHandler<GetMeQuery, Result<AccountMeResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IStudentRepository _studentRepository;

        public GetMeQueryHandler(
            IUserRepository userRepository,
            IStudentRepository studentRepository)
        {
            _userRepository = userRepository;
            _studentRepository = studentRepository;
        }

        public async Task<Result<AccountMeResponse>> Handle(GetMeQuery request, CancellationToken ct)
        {
            var user = await _userRepository.GetByPublicIdAsync(request.UserPublicId, ct);
            if (user is null)
            {
                return Result<AccountMeResponse>.Failure("Account not found.", 404);
            }

            var student = await _studentRepository.GetMeProfileByUserPublicIdAsync(request.UserPublicId, ct);
            var studentProfile = student is null
                ? null
                : new StudentProfileResponse(
                    student.StudentCode,
                    student.DateOfBirth,
                    (int)student.Gender,
                    student.Email,
                    student.PhoneNumber,
                    student.PublicId);

            return Result<AccountMeResponse>.Success(new AccountMeResponse(
                user.Email,
                user.PhoneNumber,
                user.FullName,
                studentProfile));
        }
    }
}
