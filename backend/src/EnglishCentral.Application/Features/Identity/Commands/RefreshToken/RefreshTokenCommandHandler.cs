using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IJwtService _jwtService;
        private readonly IUnitOfWork _unitOfWork;

        public RefreshTokenCommandHandler(
            IRefreshTokenRepository refreshTokenRepository,
            IJwtService jwtService,
            IUnitOfWork unitOfWork)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _jwtService = jwtService;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken ct)
        {
            var token = await _refreshTokenRepository.GetTokenByRefreshTokenAndUserIdAsync(request.UserPublicId, request.RawRefreshToken, true, ct);

            if (token is null)
            {
                return Result<AuthResponse>
                    .Failure("Invalid refresh token.", 401);
            }

            if (token.RevokedAt.HasValue)
            {
                return Result<AuthResponse>
                    .Failure("Refresh token revoked.", 401);
            }

            if (token.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                return Result<AuthResponse>
                    .Failure("Refresh token expired.", 401);
            }

            token.RevokedAt = DateTimeOffset.UtcNow;

            var user = token.User;

            var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
            var newRefreshToken = await _jwtService.GenerateRefreshTokenAsync(user, ct);

            await _unitOfWork.SaveChangesAsync(ct);

            return Result<AuthResponse>.Success(
                new AuthResponse(
                    user.PublicId,
                    user.FullName,
                    user.Email,
                    accessToken,
                    newRefreshToken,
                    expiresAt
                ));
        }
    }
}
