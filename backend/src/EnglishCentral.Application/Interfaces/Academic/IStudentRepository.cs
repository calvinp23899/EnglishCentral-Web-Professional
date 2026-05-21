using EnglishCentral.Domain.Entities.Academic;

namespace EnglishCentral.Application.Interfaces.Academic
{
    public interface IStudentRepository : IGenericRepository<Student>
    {
        Task<Student?> GetByUserPublicIdAsync(Guid userPublicId, CancellationToken ct = default);
    }
}
