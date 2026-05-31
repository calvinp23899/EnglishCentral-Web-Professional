using EnglishCentral.Application.Features.Identity.Queries.GetAccount;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Identity
{
    [Route("api/admin/account")]
    [ApiController]
    public class AccountsController : AdminBaseController
    {
        private readonly IMediator _mediator;

        public AccountsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-account")]
        [HasPermission(SystemPermissions.StudentRead)]
        public async Task<IActionResult> GetAccountByFilter([FromQuery] string? search, CancellationToken ct)
        {
            var query = new GetAccountQuery
            {
                Search = search
            };
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result.Data);
        }
    }
}
