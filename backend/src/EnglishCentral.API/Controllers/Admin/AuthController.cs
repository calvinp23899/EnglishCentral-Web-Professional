using MediatR;

namespace EnglishCentral.API.Controllers.Admin
{
    public class AuthController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }


    }
}
