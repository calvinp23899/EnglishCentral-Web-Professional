using EnglishCentral.Application.Interfaces.Academic;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Academic
{
    public class StudentRepository : GenericRepository<Student>, IStudentRepository
    {
        public StudentRepository(ApplicationDbContext db) : base(db)
        {
        }
        public async Task<bool> ExistsByUserIdAsync(long userId, CancellationToken ct = default)
        {
            return await _dbContenxt.Students
                .AnyAsync(x => x.UserId == userId && !x.IsDeleted, ct);
        }

        public async Task<List<Student>> GetAllAsync(CancellationToken ct = default)
        {
            return await _dbContenxt.Students
                .Where(x => !x.IsDeleted)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(ct);
        }

        public async Task<Student?> GetByStudentIdIncludedAccountAsync(long studentId, bool IsNoTracking = false, CancellationToken ct = default)
        {
            var query = _dbContenxt.Students
                            .Where(x => x.Id == studentId && !x.IsDeleted)
                            .Include(x => x.User)
                            .AsQueryable();
            if (IsNoTracking)
            {
                return await query.AsNoTracking().FirstOrDefaultAsync(ct);
            }
            return await query.FirstOrDefaultAsync(ct);
        }

        public async Task<Student?> GetByStudentCodeAsync(string studentCode, CancellationToken ct = default)
        {
            return await _dbContenxt.Students
                .FirstOrDefaultAsync(x => x.StudentCode == studentCode && !x.IsDeleted, ct);
        }

        public async Task<Student?> GetMeProfileByUserPublicIdAsync(Guid userPublicId, CancellationToken ct = default)
        {
            return await _dbContenxt.Students
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.User != null
                    && x.User.PublicId == userPublicId
                    && !x.IsDeleted, ct);
        }
        public async Task<(List<Student> Items, int TotalItems)> GetPagedAsync(int page, int pageSize, string? keyword, string? sortBy, bool isDescending, EStatus? status, DateOnly? enrollmentDate, CancellationToken ct = default)
        {
            var query = _dbContenxt.Students
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var search = keyword.Trim().ToLower();

                query = query.Where(x =>
                    (x.Email != null && x.Email.ToLower().Contains(search))
                    || (x.PhoneNumber != null && x.PhoneNumber.Contains(search))
                    || (x.ParentPhoneNumber != null && x.ParentPhoneNumber.Contains(search)));
            }

            if (status != null)
            {
                query = query.Where(x => x.Status == status);
            }

            if (enrollmentDate != null)
            {
                query = query.Where(x => x.EnrollmentDate == enrollmentDate);
            }

            query = sortBy?.Trim().ToLower() switch
            {
                "studentcode" => isDescending
                    ? query.OrderByDescending(x => x.StudentCode)
                    : query.OrderBy(x => x.StudentCode),

                "fullname" => isDescending
                    ? query.OrderByDescending(x => x.FullName)
                    : query.OrderBy(x => x.FullName),

                "enrollmentdate" => isDescending
                    ? query.OrderByDescending(x => x.EnrollmentDate)
                    : query.OrderBy(x => x.EnrollmentDate),

                "status" => isDescending
                    ? query.OrderByDescending(x => x.Status)
                    : query.OrderBy(x => x.Status),

                _ => isDescending
                    ? query.OrderByDescending(x => x.CreatedAt)
                    : query.OrderBy(x => x.CreatedAt)
            };

            var totalItems = await query.CountAsync(ct);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return (items, totalItems);
        }
    }
}
