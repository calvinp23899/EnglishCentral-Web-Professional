using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Commands.Register
{
    public record RegisterCommand(
        string FullName,
        string Email,
        string Password,
        string? PhoneNumber
    ) : IRequest<Result<AuthTokenResult>>;
}
