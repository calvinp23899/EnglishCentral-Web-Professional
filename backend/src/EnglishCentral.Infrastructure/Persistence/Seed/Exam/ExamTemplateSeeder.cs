using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Exam
{
    internal static class ExamTemplateSeeder
    {
        internal static async Task SeedAsync(ApplicationDbContext context)
        {
            var existTemplates = await context.ExamTemplates.AnyAsync();

            if (existTemplates)
                return;

            var template = new ExamTemplate
            {
                PublicId = Guid.NewGuid(),
                ExamTypeId = 1,
                Name = "IELTS ACADEMIC READING",
                Code = "IELTS_ACADEMIC_R",
                Description = "Mẫu đề bài đọc tiếng anh ielts học thuật",
                IsActive = true,
                DurationMinutes = 60,
                TotalScore = 40,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = SystemDefault.DefaultSystemNumber
            };
            await context.ExamTemplates.AddAsync(template);
            await context.SaveChangesAsync();
        }

    }
}
