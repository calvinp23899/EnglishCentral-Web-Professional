using EnglishCentral.Application.Interfaces;
using EnglishCentral.Infrastructure.Persistence.Context;

namespace EnglishCentral.Infrastructure.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _dbContext;

        public UnitOfWork(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IAppTransaction> BeginTransactionAsync(CancellationToken ct = default)
        {
            var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            return new AppTransaction(transaction);
        }

        public Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            return _dbContext.SaveChangesAsync(ct);
        }
    }
}
