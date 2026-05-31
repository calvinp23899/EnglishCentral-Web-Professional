using EnglishCentral.Application.Features.Identity.Queries.GetAccount;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Identity
{
    [Route("api/admin/roles")]
    public class RolesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public RolesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("get-all")]
        [HasPermission(SystemPermissions.RoleRead)]
        public async Task<IActionResult> GetAllRoles([FromQuery] string? search, CancellationToken ct)
        {
            //TODO: Update Get Role for Role screen management
            var query = new GetAccountQuery
            {
                Search = search
            };
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result.Data);
        }
    }
}
