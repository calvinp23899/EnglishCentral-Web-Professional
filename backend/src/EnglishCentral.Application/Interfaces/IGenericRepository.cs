using EnglishCentral.Domain.Common;
using EnglishCentral.Shared.Common.PaginationHelpers;
using System.Linq.Expressions;

namespace EnglishCentral.Application.Interfaces
{
    public interface IGenericRepository<T> where T : BaseEntity
    {
        IQueryable<T> Query(bool asNoTracking = true);

        Task<T?> GetByIdAsync(long id, CancellationToken ct = default, bool asNoTracking = false);

        Task<T?> FirstOrDefaultAsync(
            Expression<Func<T, bool>> predicate,
            CancellationToken ct = default,
            bool asNoTracking = true,
            params Expression<Func<T, object>>[] includes);

        Task<List<T>> ListAsync(
            Expression<Func<T, bool>>? predicate = null,
            CancellationToken ct = default,
            bool asNoTracking = true,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            params Expression<Func<T, object>>[] includes);

        Task<PagedResult<T>> GetPagedAsync(
            int page,
            int pageSize,
            Expression<Func<T, bool>>? predicate = null,
            CancellationToken ct = default,
            bool asNoTracking = true,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            params Expression<Func<T, object>>[] includes);

        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default, bool includeDeleted = false);

        Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default, bool includeDeleted = false);

        Task AddAsync(T entity, CancellationToken ct = default);

        Task AddRangeAsync(IEnumerable<T> entities, CancellationToken ct = default);

        void Update(T entity);

        void UpdateRange(IEnumerable<T> entities);

        void SoftDelete(T entity);

        void SoftDeleteRange(IEnumerable<T> entities);

        void Remove(T entity);

        void RemoveRange(IEnumerable<T> entities);
    }
}
