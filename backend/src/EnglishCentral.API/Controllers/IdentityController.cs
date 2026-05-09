using EnglishCentral.Application.Features.Identity.Commands.Login;
using EnglishCentral.Application.Features.Identity.Commands.Register;
using EnglishCentral.Contracts.Requests.Identity;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers
{

    public class IdentityController : BaseController
    {
        private readonly IMediator _mediator;
        public IdentityController(IMediator mediator)
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
    }
}
