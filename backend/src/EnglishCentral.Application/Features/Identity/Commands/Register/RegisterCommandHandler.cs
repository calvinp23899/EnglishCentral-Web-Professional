using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Shared.Constants;
using EnglishCentral.Shared.Results;
using MediatR;
using Microsoft.Extensions.Logging;

namespace EnglishCentral.Application.Features.Identity.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthTokenResult>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly ILogger<RegisterCommandHandler> _logger;

        public RegisterCommandHandler(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IPasswordService passwordService,
            IJwtService jwtService,
            IUnitOfWork unitOfWork,
            ILogger<RegisterCommandHandler> logger)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _passwordService = passwordService;
            _jwtService = jwtService;
            _logger = logger;

        }

        public async Task<Result<AuthTokenResult>> Handle(RegisterCommand request, CancellationToken ct)
        {
            var exists = await _userRepository.IsEmailExistsAsync(request.Email, ct);
            if (exists)
            {
                return Result<AuthTokenResult>.Failure("Email already in use.", 409);
            }
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
            var studentRole = await _roleRepository.GetByNameAsync(SystemRoles.Student, ct);

            if (studentRole is null)
            {
                return Result<AuthTokenResult>
                    .Failure("Default role not found.", 500);
            }

            user.UserRoles.Add(new UserRole
            {
                RoleId = studentRole.Id,
                User = user
            });

            await _userRepository.AddAsync(user, ct);

            var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
            var refreshToken = await _jwtService.GenerateRefreshTokenAsync(user, ct);
            return Result<AuthTokenResult>.Success(new AuthTokenResult(
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
