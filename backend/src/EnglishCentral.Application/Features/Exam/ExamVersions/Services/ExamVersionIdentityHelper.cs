using System.Globalization;
using System.Text;
using EnglishCentral.Application.Interfaces.Exam;
using EnglishCentral.Domain.Entities.Exam;

namespace EnglishCentral.Application.Features.Exam.ExamVersions.Services
{
    public static class ExamVersionIdentityHelper
    {
        public static async Task<int> GetNextVersionNumberAsync(
            IExamRepository<ExamVersion> repository,
            long examTemplateId,
            CancellationToken ct)
        {
            var versions = await repository.ListAsync(
                query => query.Where(x => x.ExamTemplateId == examTemplateId),
                ct);

            return versions.Count == 0 ? 1 : versions.Max(x => x.VersionNumber) + 1;
        }

        public static async Task<string> CreateUniqueSlugAsync(
            IExamRepository<ExamVersion> repository,
            long examTemplateId,
            string? requestedSlug,
            string fallbackName,
            int versionNumber,
            long? excludeVersionId,
            CancellationToken ct)
        {
            var baseSlug = Slugify(string.IsNullOrWhiteSpace(requestedSlug)
                ? $"{fallbackName}-v{versionNumber}"
                : requestedSlug);

            var slug = baseSlug;
            var suffix = 2;
            while (await repository.ExistsAsync(
                       x => x.ExamTemplateId == examTemplateId
                            && x.Slug == slug
                            && (!excludeVersionId.HasValue || x.Id != excludeVersionId.Value),
                       ct))
            {
                slug = $"{baseSlug}-{suffix++}";
            }

            return slug;
        }

        private static string Slugify(string value)
        {
            var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(normalized.Length);
            var previousDash = false;

            foreach (var character in normalized)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(character);
                if (category == UnicodeCategory.NonSpacingMark)
                    continue;

                if (char.IsLetterOrDigit(character))
                {
                    builder.Append(character);
                    previousDash = false;
                    continue;
                }

                if (!previousDash)
                {
                    builder.Append('-');
                    previousDash = true;
                }
            }

            var slug = builder.ToString().Trim('-');
            return string.IsNullOrWhiteSpace(slug) ? "exam-version" : slug;
        }
    }
}
