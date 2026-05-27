using EnglishCentral.Application.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace EnglishCentral.Infrastructure.Persistence
{
    public class AppTransaction : IAppTransaction
    {
        private readonly IDbContextTransaction _transaction;

        public AppTransaction(IDbContextTransaction transaction)
        {
            _transaction = transaction;
        }

        public Task CommitAsync(CancellationToken ct = default) => _transaction.CommitAsync(ct);

        public Task RollbackAsync(CancellationToken ct = default) => _transaction.RollbackAsync(ct);

        public ValueTask DisposeAsync() => _transaction.DisposeAsync();
    }
}
