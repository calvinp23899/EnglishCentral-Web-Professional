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
            var ieltsType = await context.ExamTypes.FirstOrDefaultAsync(x => x.Code == "ETYPE-001");
            if (ieltsType is null)
                return;

            await EnsureTemplateAsync(
                context,
                ieltsType.Id,
                code: "IELTS_ACADEMIC_R_3_PASSAGE",
                name: "IELTS ACADEMIC READING 3 PASSAGES",
                description: "Mẫu đề bài đọc tiếng Anh IELTS học thuật",
                durationMinutes: 60);

            await EnsureTemplateAsync(
                context,
                ieltsType.Id,
                code: "IELTS_ACADEMIC_L_3_PARTS",
                name: "IELTS ACADEMIC LISTENING 3 PARTS",
                description: "Mẫu đề bài nghe tiếng Anh IELTS học thuật",
                durationMinutes: 30);

            await context.SaveChangesAsync();
        }

        private static async Task EnsureTemplateAsync(
            ApplicationDbContext context,
            long examTypeId,
            string code,
            string name,
            string description,
            int durationMinutes)
        {
            if (await context.ExamTemplates.AnyAsync(x => x.Code == code))
                return;

            var template = new ExamTemplate
            {
                PublicId = Guid.NewGuid(),
                ExamTypeId = examTypeId,
                Name = name,
                Code = code,
                Description = description,
                IsActive = true,
                DurationMinutes = durationMinutes,
                TotalScore = 40,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = SystemDefault.DefaultSystemNumber
            };
            await context.ExamTemplates.AddAsync(template);
        }
    }
}
