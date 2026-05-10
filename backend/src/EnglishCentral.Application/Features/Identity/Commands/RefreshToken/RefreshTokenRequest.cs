using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.RefreshToken
{
    public record RefreshTokenCommand(
        long UserId,
        string RawRefreshToken
    ) : IRequest<Result<AuthResponse>>;
}
