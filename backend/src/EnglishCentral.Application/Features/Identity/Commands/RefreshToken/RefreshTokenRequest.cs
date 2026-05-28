using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.RefreshToken
{
    public record RefreshTokenCommand(
        string RawRefreshToken
    ) : IRequest<Result<AuthTokenResult>>;
}
