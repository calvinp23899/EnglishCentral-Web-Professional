using EnglishCentral.Application.Interfaces;
using EnglishCentral.Domain.Common;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Common.PaginationHelpers;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EnglishCentral.Infrastructure.Persistence.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        protected readonly ApplicationDbContext _dbContenxt;

        public GenericRepository(ApplicationDbContext db) => _dbContenxt = db;

        public IQueryable<T> Query(bool asNoTracking = true)
        {
            var query = _dbContenxt.Set<T>().AsQueryable();
            return asNoTracking ? query.AsNoTracking() : query;
        }

        public async Task<T?> GetByIdAsync(long id, CancellationToken ct = default, bool asNoTracking = false)
        {
            return asNoTracking
                ? await Query().FirstOrDefaultAsync(x => x.Id == id, ct)
                : await _dbContenxt.Set<T>().FindAsync([id], ct);
        }

        public async Task<T?> FirstOrDefaultAsync(
            Expression<Func<T, bool>> predicate,
            CancellationToken ct = default,
            bool asNoTracking = true,
            params Expression<Func<T, object>>[] includes)
        {
            return await ApplyIncludes(Query(asNoTracking), includes).FirstOrDefaultAsync(predicate, ct);
        }

        public async Task<List<T>> ListAsync(
            Expression<Func<T, bool>>? predicate = null,
            CancellationToken ct = default,
            bool asNoTracking = true,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            params Expression<Func<T, object>>[] includes)
        {
            var query = ApplyIncludes(Query(asNoTracking), includes);

            if (predicate is not null)
                query = query.Where(predicate);

            if (orderBy is not null)
                query = orderBy(query);

            return await query.ToListAsync(ct);
        }

        public async Task<PagedResult<T>> GetPagedAsync(
            int page,
            int pageSize,
            Expression<Func<T, bool>>? predicate = null,
            CancellationToken ct = default,
            bool asNoTracking = true,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            params Expression<Func<T, object>>[] includes)
        {
            var query = ApplyIncludes(Query(asNoTracking), includes);

            if (predicate is not null)
                query = query.Where(predicate);

            var totalItems = await query.CountAsync(ct);

            if (orderBy is not null)
                query = orderBy(query);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return PagedResult<T>.Create(items, page, pageSize, totalItems);
        }

        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default, bool includeDeleted = false)
        {
            var query = _dbContenxt.Set<T>().AsQueryable();

            if (includeDeleted)
                query = query.IgnoreQueryFilters();

            return await query.AnyAsync(predicate, ct);
        }

        public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default, bool includeDeleted = false)
        {
            var query = _dbContenxt.Set<T>().AsQueryable();

            if (includeDeleted)
                query = query.IgnoreQueryFilters();

            if (predicate is not null)
                query = query.Where(predicate);

            return await query.CountAsync(ct);
        }

        public async Task AddAsync(T entity, CancellationToken ct = default)
        {
            await _dbContenxt.Set<T>().AddAsync(entity, ct);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken ct = default)
        {
            await _dbContenxt.Set<T>().AddRangeAsync(entities, ct);
        }

        public void Update(T entity)
        {
            _dbContenxt.Set<T>().Update(entity);
        }

        public void UpdateRange(IEnumerable<T> entities)
        {
            _dbContenxt.Set<T>().UpdateRange(entities);
        }

        public void SoftDelete(T entity)
        {
            entity.IsDeleted = true;
            Update(entity);
        }

        public void SoftDeleteRange(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                entity.IsDeleted = true;
            }

            UpdateRange(entities);
        }

        public void Remove(T entity)
        {
            _dbContenxt.Set<T>().Remove(entity);
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            _dbContenxt.Set<T>().RemoveRange(entities);
        }

        private static IQueryable<T> ApplyIncludes(
            IQueryable<T> query,
            params Expression<Func<T, object>>[] includes)
        {
            return includes.Aggregate(query, (current, include) => current.Include(include));
        }
    }
}
