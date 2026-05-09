namespace EnglishCentral.Application.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(long id, CancellationToken ct = default);
        Task AddAsync(T entity, CancellationToken ct = default);
    }
}
