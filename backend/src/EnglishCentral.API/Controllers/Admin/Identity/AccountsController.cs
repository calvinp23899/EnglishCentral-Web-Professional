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

        [HttpGet("get-student-account")]
        [HasPermission(SystemPermissions.StudentRead)]
        public async Task<IActionResult> GetStudentAccountByFilter([FromQuery] string? search, CancellationToken ct)
        {
            var query = new GetAccountQuery
            {
                Search = search,
                RoleName = SystemRoles.Student
            };
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result.Data);
        }

        [HttpGet("get-teacher-account")]
        [HasPermission(SystemPermissions.TeacherRead)]
        public async Task<IActionResult> GetTeacherAccountByFilter([FromQuery] string? search, CancellationToken ct)
        {
            var query = new GetAccountQuery
            {
                Search = search,
                RoleName = SystemRoles.Teacher
            };
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result.Data);
        }
    }
}
