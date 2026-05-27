using EnglishCentral.Application.Interfaces;
using EnglishCentral.Domain.Common;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        protected readonly ApplicationDbContext _dbContenxt;

        public GenericRepository(ApplicationDbContext db) => _dbContenxt = db;

        public async Task<T?> GetByIdAsync(long id, CancellationToken ct = default, bool IsNoTracking = false)
        {
            if (IsNoTracking)
            {
                return await _dbContenxt.Set<T>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            }
            return await _dbContenxt.Set<T>().FindAsync([id], ct);
        }


        public async Task AddAsync(T entity, CancellationToken ct = default)
        {
            await _dbContenxt.Set<T>().AddAsync(entity, ct);
        }
    }
}
