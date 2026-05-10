using EnglishCentral.Application.Interfaces;
using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.Logout
{
    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public LogoutCommandHandler(
            IRefreshTokenRepository refreshTokenRepository,
            IUnitOfWork unitOfWork)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(LogoutCommand request, CancellationToken ct)
        {
            var token = await _refreshTokenRepository.GetTokenByRefreshTokenAndUserIdAsync(request.userId, request.rawRefreshToken);
            if (token is null)
            {
                return Result<bool>.Failure("Invalid refresh token", 400);
            }
            if (token.RevokedAt.HasValue)
            {
                return Result<bool>.Success(true);
            }

            if (token.ExpiresAt <= DateTimeOffset.UtcNow)
            {
                return Result<bool>.Failure(
                    "Refresh token expired.",
                    400);
            }
            token.RevokedAt = DateTimeOffset.UtcNow;

            await _unitOfWork.SaveChangesAsync(ct);

            return Result<bool>.Success(true);
        }
    }
}
