using EnglishCentral.Application.Features.Identity.Commands.Login;
using EnglishCentral.Application.Features.Identity.Commands.Logout;
using EnglishCentral.Application.Features.Identity.Commands.RefreshToken;
using EnglishCentral.Application.Features.Identity.Commands.Register;
using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Application.Features.Identity.Queries.GetMe;
using EnglishCentral.Contracts.Requests.Identity;
using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Infrastructure.Services.Identity.Models;
using EnglishCentral.Shared.Results;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace EnglishCentral.API.Controllers
{

    public class AuthController : BaseController
    {
        private readonly IMediator _mediator;
        private readonly JwtSettings _jwtSettings;

        public AuthController(
            IMediator mediator,
            IOptions<JwtSettings> jwtOptions)
        {
            _mediator = mediator;
            _jwtSettings = jwtOptions.Value;
        }

        [AllowAnonymous]
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

            return ToAuthResponse(result);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
        {
            var command = new LoginCommand(request.Email, request.Password);

            var result = await _mediator.Send(command, ct);

            return ToAuthResponse(result);
        }

        [AllowAnonymous]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout(LogoutRequest request, CancellationToken ct)
        {
            var rawRefreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrWhiteSpace(rawRefreshToken))
            {
                return BadRequest(new { error = "Refresh token is required." });
            }

            var command = new LogoutCommand(request.UserPublicId, rawRefreshToken);
            var result = await _mediator.Send(command, ct);

            if (result.IsSuccess)
            {
                ClearRefreshTokenCookie();
                return Ok(result.Data);
            }

            return StatusCode(result.StatusCode, new { error = result.Error });
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshTokenRequest request, CancellationToken ct)
        {
            var rawRefreshToken = request.RefreshToken
                ?? Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrWhiteSpace(rawRefreshToken))
            {
                return BadRequest(new { error = "Refresh token is required." });
            }

            var command = new RefreshTokenCommand(request.UserPublicId, rawRefreshToken);
            var result = await _mediator.Send(command, ct);

            return ToAuthResponse(result);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me(CancellationToken ct)
        {
            if (CurrentUserPublicId is not { } publicId)
            {
                return Unauthorized(new { error = "Invalid access token." });
            }

            var result = await _mediator.Send(new GetMeQuery(publicId), ct);

            return result.IsSuccess
                ? Ok(result.Data)
                : StatusCode(result.StatusCode, new { error = result.Error });
        }

        private IActionResult ToAuthResponse(Result<AuthTokenResult> result)
        {
            if (!result.IsSuccess || result.Data is null)
            {
                return StatusCode(result.StatusCode, new { error = result.Error });
            }

            SetRefreshTokenCookie(
                result.Data.RefreshToken,
                DateTimeOffset.UtcNow.AddDays(_jwtSettings.RefreshTokenDays));

            var response = new AuthResponse(
                result.Data.PublicId,
                result.Data.FullName,
                result.Data.Email,
                result.Data.AccessToken,
                result.Data.AccessTokenExpiresAt);

            return StatusCode(result.StatusCode, response);
        }
    }
}
