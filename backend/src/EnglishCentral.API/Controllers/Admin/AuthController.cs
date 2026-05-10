using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin
{
    public class AuthController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HasPermission(SystemPermissions.StudentCreate)]
        [HttpPost("")]
        public async Task<IActionResult> ExampleAPI(string request)
        {
            throw new NotImplementedException();
        }

    }
}
