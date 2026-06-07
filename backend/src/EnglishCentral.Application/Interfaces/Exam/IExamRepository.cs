using System.Linq.Expressions;
using EnglishCentral.Domain.Common;

namespace EnglishCentral.Application.Interfaces.Exam
{
    public interface IExamRepository<T> where T : BaseEntity
    {
        IQueryable<T> Query(bool asNoTracking = true);

        Task<T?> GetByIdAsync(long id, CancellationToken ct = default);

        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default, bool asNoTracking = true);

        Task AddAsync(T entity, CancellationToken ct = default);

        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default, bool includeDeleted = false);

        Task<int> CountAsync(Func<IQueryable<T>, IQueryable<T>> configure, CancellationToken ct = default);

        Task<List<T>> ListAsync(Func<IQueryable<T>, IQueryable<T>> configure, CancellationToken ct = default, bool asNoTracking = true);
    }
}
