using EnglishCentral.Application.Features.Identity.Commands.Login;
using EnglishCentral.Application.Features.Identity.Commands.Logout;
using EnglishCentral.Application.Features.Identity.Commands.RefreshToken;
using EnglishCentral.Application.Features.Identity.Commands.Register;
using EnglishCentral.Contracts.Requests.Identity;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers
{

    public class AuthController : BaseController
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct)
        {
            var command = new RegisterCommand(
                request.FullName,
                request.Email,
                request.Password,
                request.PhoneNumber
            );

            var result = await _mediator.Send(command, ct);

            return result.IsSuccess
                ? StatusCode(result.StatusCode, result.Data)
                : StatusCode(result.StatusCode, new { error = result.Error });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
        {
            var command = new LoginCommand(request.Email, request.Password);

            var result = await _mediator.Send(command, ct);

            return result.IsSuccess
                ? Ok(result.Data)
                : StatusCode(result.StatusCode, new { error = result.Error });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout(LogoutRequest request, CancellationToken ct)
        {
            var command = new LogoutCommand(request.UserPublicId, request.RawRefreshToken);
            var result = await _mediator.Send(command, ct);

            return result.IsSuccess
                ? Ok(result.Data)
                : StatusCode(result.StatusCode, new { error = result.Error });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshTokenRequest request)
        {
            var command = new RefreshTokenCommand(request.UserPublicId, request.RefreshToken);
            var result = await _mediator.Send(command);

            return result.IsSuccess
                ? Ok(result.Data)
                : StatusCode(result.StatusCode, new { error = result.Error });
        }
    }
}
