namespace EnglishCentral.Application.Interfaces
{
    public interface IUnitOfWork
    {
        Task<IAppTransaction> BeginTransactionAsync(CancellationToken ct = default);
        Task<int> SaveChangesAsync(CancellationToken ct = default);
    }
}
