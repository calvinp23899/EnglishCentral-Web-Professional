using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Exam
{
    internal static class ExamTypeSeeder
    {
        internal static async Task SeedAsync(ApplicationDbContext context)
        {
            var existingExamTypes = await context.ExamTypes.AnyAsync();

            if (existingExamTypes)
                return;

            var defaultPolicy = new ExamType
            {
                PublicId = Guid.NewGuid(),
                Code = $"ETYPE-001",
                Name = "IELTS",
                Family = Domain.Enums.Exam.EExamFamily.IELTS,
                Description = "Dạng bài theo kiểu IELTS",
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = SystemDefault.DefaultSystemNumber
            };
            await context.ExamTypes.AddAsync(defaultPolicy);
            await context.SaveChangesAsync();
        }

    }
}
