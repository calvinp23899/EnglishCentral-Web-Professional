using EnglishCentral.Application.Interfaces.Identity;
using EnglishCentral.Contracts.Responses.Metadata;
using EnglishCentral.Shared.Results;
using MediatR;

namespace EnglishCentral.Application.Features.Identity.Queries.GetRoles
{
    public class GetRoleQueryHandler : IRequestHandler<GetRoleQuery, Result<List<MetadataRoleResponse>>>
    {
        private readonly IRoleRepository _roleRepository;

        public GetRoleQueryHandler(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<Result<List<MetadataRoleResponse>>> Handle(GetRoleQuery request, CancellationToken cancellationToken)
        {
            var roles = await _roleRepository.GetAllRoleAsync(cancellationToken);
            if (roles is null)
            {
                return Result<List<MetadataRoleResponse>>.Failure("Roles are not found.", 404);
            }
            var response = roles
                    .Select(x => new MetadataRoleResponse(
                        x.Id,
                        x.Name))
                    .ToList();
            return Result<List<MetadataRoleResponse>>.Success(response);
        }
    }
}
