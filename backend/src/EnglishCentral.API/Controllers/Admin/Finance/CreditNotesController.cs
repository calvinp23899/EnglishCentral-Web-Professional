using EnglishCentral.Application.Features.Finance.CreditNotes.Commands.ApplyCreditNote;
using EnglishCentral.Application.Features.Finance.CreditNotes.Commands.CreateCreditNote;
using EnglishCentral.Application.Features.Finance.CreditNotes.Queries.GetCreditNoteById;
using EnglishCentral.Application.Features.Finance.CreditNotes.Queries.GetCreditNotes;
using EnglishCentral.Infrastructure.Authorization;
using EnglishCentral.Shared.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCentral.API.Controllers.Admin.Finance
{
    [Route("api/admin/billing/credit-notes")]
    [ApiController]
    public class CreditNotesController : AdminBaseController
    {
        private readonly IMediator _mediator;
        public CreditNotesController(IMediator mediator) => _mediator = mediator;
        [HttpGet("get-list")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetList([FromQuery] GetCreditNotesQuery query, CancellationToken ct)
        {
            var result = await _mediator.Send(query, ct);
            return StatusCode(result.StatusCode, result);
        }
        [HttpGet("{id:long}/get-by-id")]
        [HasPermission(SystemPermissions.BillingRead)]
        public async Task<IActionResult> GetById(long id, CancellationToken ct)
        {
            var result = await _mediator.Send(new GetCreditNoteByIdQuery(id), ct);
            return StatusCode(result.StatusCode, result);
        }
        [HttpPost("insert")]
        [HasPermission(SystemPermissions.BillingCreate)]
        public async Task<IActionResult> Create(CreateCreditNoteCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command, ct);
            return StatusCode(result.StatusCode, result);
        }
        [HttpPost("{id:long}/apply")]
        [HasPermission(SystemPermissions.BillingUpdate)]
        public async Task<IActionResult> Apply(long id, ApplyCreditNoteCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command with { CreditNoteId = id }, ct);
            return StatusCode(result.StatusCode, result);
        }
    }
}
