using EnglishCentral.Contracts.Responses.Identity;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetMe
{
    public record GetMeQuery(Guid UserPublicId) : IRequest<Result<AccountMeResponse>>;
}
