using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.Logout
{
    public record LogoutCommand(
        long userId,
        string rawRefreshToken
    ) : IRequest<Result<bool>>;
}
