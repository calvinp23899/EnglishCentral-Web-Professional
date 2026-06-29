using EnglishCentral.Contracts.Responses.Metadata;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetRoles
{
    public record GetRoleQuery() : IRequest<Result<List<MetadataRoleResponse>>>;
}
