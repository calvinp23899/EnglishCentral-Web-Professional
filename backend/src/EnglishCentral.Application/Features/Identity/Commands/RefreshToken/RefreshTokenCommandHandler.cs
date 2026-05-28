using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthTokenResult>>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IJwtService _jwtService;

        public RefreshTokenCommandHandler(
            IRefreshTokenRepository refreshTokenRepository,
            IJwtService jwtService,
            IUnitOfWork unitOfWork)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _jwtService = jwtService;
        }

        public async Task<Result<AuthTokenResult>> Handle(RefreshTokenCommand request, CancellationToken ct)
        {
            var token = await _refreshTokenRepository.GetTokenByRefreshTokenAsync(request.RawRefreshToken, true, ct);

            if (token is null)
            {
                return Result<AuthTokenResult>
                    .Failure("Invalid refresh token.", 401);
            }

            if (token.RevokedAt.HasValue)
            {
                return Result<AuthTokenResult>
                    .Failure("Refresh token revoked.", 401);
            }

            if (token.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                return Result<AuthTokenResult>
                    .Failure("Refresh token expired.", 401);
            }

            token.RevokedAt = DateTimeOffset.UtcNow;

            var user = token.User;

            var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
            var newRefreshToken = await _jwtService.GenerateRefreshTokenAsync(user, ct);

            return Result<AuthTokenResult>.Success(
                new AuthTokenResult(
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
