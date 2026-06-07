using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Shared.Common.PaginationHelpers;

namespace EnglishCentral.Application.Interfaces.Exam
{
    public interface IExamReadRepository
    {
        Task<ExamVersion?> GetVersionWithContentAsync(long id, bool asNoTracking = true, CancellationToken ct = default);

        Task<ExamVersion?> GetVersionWithSectionsAsync(long id, CancellationToken ct = default);

        Task<ExamAttempt?> GetAttemptWithDetailsAsync(long id, bool asNoTracking = true, CancellationToken ct = default);

        Task<ExamAttempt?> GetAttemptForSubmitAsync(long id, CancellationToken ct = default);

        Task<PagedResult<ExamAttempt>> GetAttemptsAsync(
            int page,
            int pageSize,
            long? examVersionId,
            long? studentId,
            EExamAttemptStatus? status,
            string? keyword,
            bool isDescending,
            CancellationToken ct = default);
    }
}
