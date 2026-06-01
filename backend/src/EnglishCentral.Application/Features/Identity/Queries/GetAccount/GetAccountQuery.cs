using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetAccount
{
    public class GetAccountQuery : IRequest<Result<List<AccountResponse>>>
    {
        public string? Search { get; init; }

        public string RoleName { get; init; } = default!;
    }
}
