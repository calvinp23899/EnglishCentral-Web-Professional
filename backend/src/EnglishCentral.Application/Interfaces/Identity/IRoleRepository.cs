using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IRoleRepository : IGenericRepository<Role>
    {
        Task<Role?> GetByNameAsync(string name, CancellationToken ct = default);
    }
}
