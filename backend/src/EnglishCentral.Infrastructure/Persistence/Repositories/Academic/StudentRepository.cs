using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Academic
{
    public class StudentRepository : GenericRepository<Student>, IStudentRepository
    {
        public StudentRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<Student?> GetByUserPublicIdAsync(Guid userPublicId, CancellationToken ct = default)
        {
            return await _dbContenxt.Students
                .FirstOrDefaultAsync(x => x.User != null && x.User.PublicId == userPublicId, ct);
        }
    }
}
