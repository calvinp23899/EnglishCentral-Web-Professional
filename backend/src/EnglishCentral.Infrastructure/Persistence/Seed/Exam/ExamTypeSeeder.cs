using EnglishCentral.Domain.Entities.Exam;
using EnglishCentral.Domain.Enums.Exam;
using EnglishCentral.Infrastructure.Persistence.Context;
using EnglishCentral.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace EnglishCentral.Infrastructure.Persistence.Seed.Exam
{
    internal static class ExamTypeSeeder
    {
        internal static async Task SeedAsync(ApplicationDbContext context)
        {
            if (!await context.ExamTypes.AnyAsync(x => x.Code == "ETYPE-001"))
            {
                var ielts = new ExamType
                {
                    PublicId = Guid.NewGuid(),
                    Code = "ETYPE-001",
                    Name = "IELTS",
                    Family = EExamFamily.IELTS,
                    Description = "Dạng bài theo kiểu IELTS",
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    CreatedBy = SystemDefault.DefaultSystemNumber
                };

                await context.ExamTypes.AddAsync(ielts);
            }

            await context.SaveChangesAsync();
        }
    }
}
