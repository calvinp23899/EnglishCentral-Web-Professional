using EnglishCentral.Application.Features.Identity.DTOs;
using EnglishCentral.Domain.Entities.Authentication;

namespace EnglishCentral.Application.Interfaces.Identity
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<UserWithStudentResult?> GetByEmailAsync(string email, CancellationToken ct = default);
        Task<bool> IsEmailExistsAsync(string email, CancellationToken ct = default);
        Task<bool> IsPhoneNumberExistsAsync(string phoneNumber, CancellationToken ct = default);
        Task<User?> GetByPublicIdAsync(Guid publicId, CancellationToken ct = default);
        Task<User?> GetByIdWithRolesAsync(long id, CancellationToken ct = default);
        Task<List<User>> GetUserAccountBySearch(string? search, string roleName, CancellationToken ct = default);
    }
}
