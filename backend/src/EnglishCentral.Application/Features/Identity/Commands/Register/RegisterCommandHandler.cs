using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly IUnitOfWork _unitOfWork;
        public RegisterCommandHandler(
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

        public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken ct)
        {
            // 1. Check email duplicate
            var exists = await _userRepository.ExistsByEmailAsync(request.Email, ct);
            if (exists)
                return Result<AuthResponse>.Failure("Email already in use.", 409);

            // 2. Create user entity
            var user = new User
            {
                PublicId = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = _passwordService.Hash(request.Password),
                PhoneNumber = request.PhoneNumber,
                IsActive = true,
                EmailConfirmed = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _userRepository.AddAsync(user, ct);

            // 3. Issue tokens
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
            ), 201);
        }
    }
}
