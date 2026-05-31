using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Interfaces.Academic
{
    public interface IStudentRepository : IGenericRepository<Student>
    {
        Task<Student?> GetByStudentIdIncludedAccountAsync(long userId, bool IsNoTracking = false, CancellationToken ct = default);
        Task<Student?> GetByStudentCodeAsync(string studentCode, CancellationToken ct = default);
        Task<List<Student>> GetAllAsync(CancellationToken ct = default);
        Task<Student?> GetMeProfileByUserPublicIdAsync(Guid userPublicId, CancellationToken ct = default);
        Task<bool> ExistsByUserIdAsync(long userId, CancellationToken ct = default);
        Task<(List<Student> Items, int TotalItems)> GetPagedAsync(int page, int pageSize, string? keyword, string? sortBy, bool isDescending, EStatus? status, DateOnly? EnrollmentDate, CancellationToken ct = default);
    }
}

