using EnglishCentral.Application.Interfaces;
using EnglishCentral.Infrastructure.Persistence.Context;

namespace EnglishCentral.Infrastructure.Persistence.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _db;

        public GenericRepository(ApplicationDbContext db) => _db = db;

        public async Task<T?> GetByIdAsync(long id, CancellationToken ct = default)
        {
            return await _db.Set<T>().FindAsync([id], ct);
        }


        public async Task AddAsync(T entity, CancellationToken ct = default)
        {
            await _db.Set<T>().AddAsync(entity, ct);
        }
    }
}
