using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly IUnitOfWork _unitOfWork;

        public LoginCommandHandler(
            IUserRepository userRepository,
            IPasswordService passwordService,
            IJwtService jwtService,
            IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _passwordService = passwordService;
            _jwtService = jwtService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken ct)
        {
            // 1. Find user
            var user = await _userRepository.GetByEmailAsync(request.Email, ct);
            if (user is null || !_passwordService.Verify(request.Password, user.PasswordHash))
                return Result<AuthResponse>.Failure("Invalid email or password.", 401);

            // 2. Check active
            if (!user.IsActive)
                return Result<AuthResponse>.Failure("Account is disabled.", 403);

            // 3. Update LastLoginAt
            user.LastLoginAt = DateTimeOffset.UtcNow;

            // 4. Issue tokens
            var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
            var refreshToken = await _jwtService.GenerateRefreshTokenAsync(user, ct);

            await _unitOfWork.SaveChangesAsync(ct);
            return Result<AuthResponse>.Success(new AuthResponse(
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
