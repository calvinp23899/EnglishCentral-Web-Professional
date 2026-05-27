using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthTokenResult>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;

        public LoginCommandHandler(
            IUserRepository userRepository,
            IPasswordService passwordService,
            IJwtService jwtService)
        {
            _userRepository = userRepository;
            _passwordService = passwordService;
            _jwtService = jwtService;
        }

        public async Task<Result<AuthTokenResult>> Handle(LoginCommand request, CancellationToken ct)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email, ct);
            if (user is null || !_passwordService.Verify(request.Password, user.PasswordHash))
                return Result<AuthTokenResult>.Failure("Invalid email or password.", 401);

            if (!user.IsActive)
                return Result<AuthTokenResult>.Failure("Account is disabled.", 403);

            user.LastLoginAt = DateTimeOffset.UtcNow;

            var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
            var refreshToken = await _jwtService.GenerateRefreshTokenAsync(user, ct);

            return Result<AuthTokenResult>.Success(new AuthTokenResult(
                user.PublicId,
                user.FullName,
                user.Email,
                accessToken,
                refreshToken,
                expiresAt
            ));
        }
    }
}
