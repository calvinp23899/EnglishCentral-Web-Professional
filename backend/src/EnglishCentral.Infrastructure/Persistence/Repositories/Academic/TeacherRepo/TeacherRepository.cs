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

        public async Task<Teacher?> GetMeProfileByUserPublicIdAsync(Guid userPublicId, CancellationToken ct = default)
        {
            return await _dbContenxt.Teachers
                .AsNoTracking()
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.User.PublicId == userPublicId && !x.IsDeleted, ct);
        }

        public async Task<(List<Teacher> Items, int TotalItems)> GetPagedAsync(
            int page,
            int pageSize,
            string? keyword,
            EColumnSortGetTeacher? sortBy,
            EOrderSort orderSort,
            ETeacherStatus? status,
            DateOnly? hireDate,
            string? role,
            CancellationToken ct = default)
        {
            var query = _dbContenxt.Teachers
                .Include(x => x.User)
                    .ThenInclude(x => x.UserRoles)
                        .ThenInclude(x => x.Role)
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

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(x => x.User.UserRoles.Any(userRole => userRole.Role.Name == role));
            }

            var isDescending = orderSort == EOrderSort.Descending;

            query = sortBy switch
            {
                EColumnSortGetTeacher.TeacherCode => isDescending
                    ? query.OrderByDescending(x => x.TeacherCode)
                    : query.OrderBy(x => x.TeacherCode),

                EColumnSortGetTeacher.FullName => isDescending
                    ? query.OrderByDescending(x => x.FullName)
                    : query.OrderBy(x => x.FullName),

                EColumnSortGetTeacher.HireDate => isDescending
                    ? query.OrderByDescending(x => x.HireDate)
                    : query.OrderBy(x => x.HireDate),

                EColumnSortGetTeacher.Status => isDescending
                    ? query.OrderByDescending(x => x.Status)
                    : query.OrderBy(x => x.Status),

                EColumnSortGetTeacher.Role => isDescending
                    ? query.OrderByDescending(x => x.User.UserRoles
                        .Select(ur => ur.Role.Name)
                        .FirstOrDefault())
                    : query.OrderBy(x => x.User.UserRoles
                        .Select(ur => ur.Role.Name)
                        .FirstOrDefault()),

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
