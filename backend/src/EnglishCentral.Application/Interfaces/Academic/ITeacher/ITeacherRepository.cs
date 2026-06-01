using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;

namespace EnglishCentral.Application.Interfaces.Academic.ITeacher

{
    public interface ITeacherRepository : IGenericRepository<Teacher>
    {
        Task<bool> ExistsByUserIdAsync(long userId, CancellationToken ct = default);

        Task<Teacher?> GetByTeacherCodeAsync(string teacherCode, CancellationToken ct = default);

        Task<Teacher?> GetByTeacherIdIncludedAccountAsync(long teacherId, CancellationToken ct = default);

        Task<Teacher?> GetMeProfileByUserPublicIdAsync(Guid userPublicId, CancellationToken ct = default);

        Task<(List<Teacher> Items, int TotalItems)> GetPagedAsync(
            int page,
            int pageSize,
            string? keyword,
            EColumnSortGetTeacher? sortBy,
            EOrderSort orderSort,
            ETeacherStatus? status,
            DateOnly? hireDate,
            string? role,
            CancellationToken ct = default);
    }
}
