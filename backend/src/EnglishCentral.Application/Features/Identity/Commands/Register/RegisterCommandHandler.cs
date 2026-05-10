using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Domain.Entities.Authentication;
using EnglishCentral.Shared.Constants;
using EnglishCentral.Shared.Results;
using MediatR;
using Microsoft.Extensions.Logging;

namespace EnglishCentral.Application.Features.Identity.Commands.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<AuthResponse>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordService _passwordService;
        private readonly IJwtService _jwtService;
        private readonly IUnitOfWork _unitOfWork;
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
            _unitOfWork = unitOfWork;
            _logger = logger;

        }

        public async Task<Result<AuthResponse>> Handle(RegisterCommand request, CancellationToken ct)
        {
            _logger.LogInformation($"-----Starting running {typeof(RegisterCommandHandler)} -----");
            _logger.LogInformation("Checking exist email - {Email}", request.Email);
            var exists = await _userRepository.ExistsByEmailAsync(request.Email, ct);
            if (exists)
            {
                _logger.LogWarning("Register failed because email already exists {0}", request.Email);
                return Result<AuthResponse>.Failure("Email already in use.", 409);
            }
            _logger.LogInformation("Trying Adding UserEmail - {0}", request.Email);
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
            var studentRole = await _roleRepository.GetByNameAsync(SystemRoles.Student, ct);

            if (studentRole is null)
            {
                return Result<AuthResponse>
                    .Failure("Default role not found.", 500);
            }

            user.UserRoles.Add(new UserRole
            {
                RoleId = studentRole.Id,
                User = user
            });
            await _userRepository.AddAsync(user, ct);

            _logger.LogInformation("Adding successfully user with email - {0}", request.Email);

            _logger.LogInformation("Trying generating Token");
            var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
            var refreshToken = await _jwtService.GenerateRefreshTokenAsync(user, ct);
            _logger.LogInformation("Generating token successfuly accessToken - {0}", string.Empty);

            await _unitOfWork.SaveChangesAsync(ct);
            _logger.LogInformation($"-----Ending running {typeof(RegisterCommandHandler)} ------");
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
