using EnglishCentral.Application.Interfaces.Academic.ITeacher;
using EnglishCentral.Domain.Entities.Academic;
using EnglishCentral.Domain.Enums.Academic;
using EnglishCentral.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Repositories.Academic.TeacherRepo
{
    public class TeacherRepository : GenericRepository<Teacher>, ITeacherRepository
    {
        public TeacherRepository(ApplicationDbContext db) : base(db)
        {
        }

        public async Task<bool> ExistsByUserIdAsync(long userId, CancellationToken ct = default)
        {
            return await _dbContenxt.Teachers
                .AnyAsync(x => x.UserId == userId && !x.IsDeleted, ct);
        }

        public async Task<Teacher?> GetByTeacherCodeAsync(string teacherCode, CancellationToken ct = default)
        {
            return await _dbContenxt.Teachers
                .FirstOrDefaultAsync(x => x.TeacherCode == teacherCode && !x.IsDeleted, ct);
        }

        public async Task<Teacher?> GetByTeacherIdIncludedAccountAsync(long teacherId, CancellationToken ct = default)
        {
            return await _dbContenxt.Teachers
                .AsNoTracking()
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == teacherId && !x.IsDeleted, ct);
        }

        public async Task<(List<Teacher> Items, int TotalItems)> GetPagedAsync(
            int page,
            int pageSize,
            string? keyword,
            string? sortBy,
            bool isDescending,
            TeacherStatus? status,
            DateOnly? hireDate,
            CancellationToken ct = default)
        {
            var query = _dbContenxt.Teachers
                .Include(x => x.User)
                .AsNoTracking()
                .Where(x => !x.IsDeleted)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var search = keyword.Trim().ToLower();

                query = query.Where(x =>
                    x.TeacherCode.ToLower().Contains(search)
                    || x.FullName.ToLower().Contains(search)
                    || (x.Email != null && x.Email.ToLower().Contains(search))
                    || (x.PhoneNumber != null && x.PhoneNumber.Contains(search))
                    || (x.Specialization != null && x.Specialization.ToLower().Contains(search)));
            }

            if (status.HasValue)
            {
                query = query.Where(x => x.Status == status.Value);
            }

            if (hireDate.HasValue)
            {
                query = query.Where(x => x.HireDate == hireDate.Value);
            }

            query = sortBy?.Trim().ToLower() switch
            {
                "teachercode" => isDescending ? query.OrderByDescending(x => x.TeacherCode) : query.OrderBy(x => x.TeacherCode),
                "fullname" => isDescending ? query.OrderByDescending(x => x.FullName) : query.OrderBy(x => x.FullName),
                "hiredate" => isDescending ? query.OrderByDescending(x => x.HireDate) : query.OrderBy(x => x.HireDate),
                "status" => isDescending ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
                "specialization" => isDescending ? query.OrderByDescending(x => x.Specialization) : query.OrderBy(x => x.Specialization),
                _ => isDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
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
