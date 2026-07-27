using EnglishCentral.Domain.Entities.CRM;
using EnglishCentral.Domain.Enums.CRM;
using EnglishCentral.Shared.Common.PaginationHelpers;

namespace EnglishCentral.Application.Interfaces.CRM
{
    public interface ILeadSourceRepository : IGenericRepository<LeadSource>
    {
        Task<bool> ExistsByCodeAsync(string code, long? excludeId = null, CancellationToken ct = default);
    }

    public interface ILeadRepository : IGenericRepository<Lead>
    {
        Task<PagedResult<Lead>> GetPagedWithDetailsAsync(
            int page,
            int pageSize,
            string? keyword,
            ELeadStatus? status,
            ELeadLostReason? lostReason,
            long? leadSourceId,
            long? assignedToUserId,
            long? interestedCourseId,
            DateTimeOffset? createdFrom,
            DateTimeOffset? createdTo,
            DateTimeOffset? nextFollowUpFrom,
            DateTimeOffset? nextFollowUpTo,
            bool isDescending,
            CancellationToken ct = default);

        Task<Lead?> GetByIdWithDetailsAsync(long id, CancellationToken ct = default, bool asNoTracking = true);

        Task<bool> ExistsByLeadCodeAsync(string leadCode, CancellationToken ct = default);
    }

    public interface ILeadActivityRepository : IGenericRepository<LeadActivity>
    {
        Task<List<LeadActivity>> GetByLeadIdAsync(long leadId, CancellationToken ct = default);
    }

    public interface ILeadConversionRepository : IGenericRepository<LeadConversion>
    {
        Task<PagedResult<LeadConversion>> GetPagedWithDetailsAsync(
            int page,
            int pageSize,
            long? leadSourceId,
            long? convertedByUserId,
            DateTimeOffset? convertedFrom,
            DateTimeOffset? convertedTo,
            bool isDescending,
            CancellationToken ct = default);

        Task<LeadConversion?> GetByIdWithDetailsAsync(long id, CancellationToken ct = default);
    }
}
