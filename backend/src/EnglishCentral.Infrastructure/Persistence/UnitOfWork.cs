using EnglishCentral.Application.Interfaces;
using EnglishCentral.Domain.Common;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ICurrentUserService _currentUserService;


        public UnitOfWork(ApplicationDbContext dbContext, ICurrentUserService currentUserService)
        {
            _dbContext = dbContext;
            _currentUserService = currentUserService;
        }

        public async Task<IAppTransaction> BeginTransactionAsync(CancellationToken ct = default)
        {
            var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            return new AppTransaction(transaction);
        }

        public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            var userId = _currentUserService.UserId;
            var now = DateTimeOffset.UtcNow;

            foreach (var entry in _dbContext.ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = userId;
                }
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy = userId;
                    if (entry.Entity.IsDeleted &&
                        entry.Entity.DeletedAt is null)
                    {
                        entry.Entity.DeletedAt = now;
                        entry.Entity.DeletedBy = userId;
                    }
                    entry.Property(x => x.CreatedAt).IsModified = false;
                    entry.Property(x => x.CreatedBy).IsModified = false;
                }
            }

            return await _dbContext.SaveChangesAsync(ct);
        }
    }
}
