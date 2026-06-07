using System.Linq.Expressions;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Common;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Exam
{
    public class ExamRepository<T> : IExamRepository<T> where T : BaseEntity
    {
        private readonly ApplicationDbContext _db;

        public ExamRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public IQueryable<T> Query(bool asNoTracking = true)
        {
            var query = _db.Set<T>().AsQueryable();
            return asNoTracking ? query.AsNoTracking() : query;
        }

        public async Task<T?> GetByIdAsync(long id, CancellationToken ct = default)
        {
            return await _db.Set<T>().FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default, bool asNoTracking = true)
        {
            return await Query(asNoTracking).FirstOrDefaultAsync(predicate, ct);
        }

        public async Task AddAsync(T entity, CancellationToken ct = default)
        {
            await _db.Set<T>().AddAsync(entity, ct);
        }

        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default, bool includeDeleted = false)
        {
            var query = _db.Set<T>().AsQueryable();
            if (includeDeleted)
                query = query.IgnoreQueryFilters();

            return await query.AnyAsync(predicate, ct);
        }

        public async Task<int> CountAsync(Func<IQueryable<T>, IQueryable<T>> configure, CancellationToken ct = default)
        {
            return await configure(Query()).CountAsync(ct);
        }

        public async Task<List<T>> ListAsync(Func<IQueryable<T>, IQueryable<T>> configure, CancellationToken ct = default, bool asNoTracking = true)
        {
            return await configure(Query(asNoTracking)).ToListAsync(ct);
        }
    }
}
