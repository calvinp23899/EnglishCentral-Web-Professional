using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.Login
{
    public record LoginCommand(
        string Email,
        string Password
    ) : IRequest<Result<AuthTokenResult>>;
}
